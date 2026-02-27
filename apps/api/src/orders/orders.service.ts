import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrdersQueryDto } from './dto/get-orders-query.dto';
import { ImportOrdersResult, ImportOrderRowError } from './dto/import-orders.dto';
import { JurisdictionDto } from './dto/jurisdiction.dto';
import { PDFParse } from 'pdf-parse';

const ORDERS_ASSETS_DIR = 'assets';

type Position = [number, number];

interface TaxRateRaw {
  composite_rate: number;
  state_rate: number;
  county_rate: number;
  special_rate: number;
}

type TaxRateDataset = Record<string, TaxRateRaw>;

interface GeoJsonFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
}

interface GeoJsonFeature {
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
  properties: {
    name: string;
  };
  type: 'Feature';
}

type PolygonCoordinates = Position[][];
type MultiPolygonCoordinates = PolygonCoordinates[];

interface CountyFeature {
  countyName: string;
  normalizedCountyName: string;
  polygons: MultiPolygonCoordinates;
  bbox: {
    minLng: number;
    maxLng: number;
    minLat: number;
    maxLat: number;
  };
}

type OrderWithLocation = Prisma.OrderGetPayload<{
  include: {
    location: {
      include: {
        taxRateRegion: {
          include: {
            jurisdictions: true;
          };
        };
      };
    };
  };
}>;

type TaxRateRegionWithJurisdictions = Prisma.TaxRateRegionGetPayload<{
  include: {
    jurisdictions: true;
  };
}>;

@Injectable()
export class OrdersService implements OnModuleInit {
  private countyFeatures: CountyFeature[] = [];
  private taxRegionsByCounty = new Map<string, TaxRateRegionWithJurisdictions>();
  private bootstrapPromise: Promise<void> | null = null;

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureBootstrap();
  }

  async createOrder(payload: CreateOrderDto): Promise<OrderWithLocation> {
    await this.ensureBootstrap();
    return this.createOrderInternal(payload, false);
  }

  async getOrders(query: GetOrdersQueryDto) {
    await this.ensureBootstrap();

    const page = this.parseInteger(query.page, 'page', 1, 1);
    const limit = this.parseInteger(query.limit, 'limit', 20, 1, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    if (query.id?.trim()) {
      where.id = query.id.trim();
    }

    if (query.dateFrom || query.dateTo) {
      const dateFilter: Prisma.DateTimeFilter<'Order'> = {};

      if (query.dateFrom) {
        dateFilter.gte = this.parseDate(query.dateFrom, 'dateFrom');
      }
      if (query.dateTo) {
        dateFilter.lte = this.parseDate(query.dateTo, 'dateTo');
      }

      if (dateFilter.gte && dateFilter.lte && dateFilter.gte > dateFilter.lte) {
        throw new BadRequestException('dateFrom must be less than or equal to dateTo');
      }

      where.timestamp = dateFilter;
    }

    if (query.minSubtotal || query.maxSubtotal) {
      const minSubtotal =
        query.minSubtotal !== undefined
          ? this.parseNumber(query.minSubtotal, 'minSubtotal')
          : undefined;
      const maxSubtotal =
        query.maxSubtotal !== undefined
          ? this.parseNumber(query.maxSubtotal, 'maxSubtotal')
          : undefined;

      if (minSubtotal !== undefined && minSubtotal < 0) {
        throw new BadRequestException('minSubtotal must be greater than or equal to 0');
      }
      if (maxSubtotal !== undefined && maxSubtotal < 0) {
        throw new BadRequestException('maxSubtotal must be greater than or equal to 0');
      }
      if (minSubtotal !== undefined && maxSubtotal !== undefined && minSubtotal > maxSubtotal) {
        throw new BadRequestException(
          'minSubtotal must be less than or equal to maxSubtotal',
        );
      }

      const subtotalFilter: Prisma.DecimalFilter<'Order'> = {};
      if (minSubtotal !== undefined) {
        subtotalFilter.gte = this.toMoneyDecimal(minSubtotal);
      }
      if (maxSubtotal !== undefined) {
        subtotalFilter.lte = this.toMoneyDecimal(maxSubtotal);
      }
      where.subtotal = subtotalFilter;
    }

    const locationFilter: Prisma.LocationWhereInput = {};

    if (query.taxRateRegionId?.trim()) {
      locationFilter.taxRateRegionId = query.taxRateRegionId.trim();
    }

    if (query.taxRateRegionName?.trim()) {
      locationFilter.taxRateRegion = {
        name: {
          equals: query.taxRateRegionName.trim(),
          mode: 'insensitive',
        },
      };
    }

    if (Object.keys(locationFilter).length > 0) {
      where.location = locationFilter;
    }

    const [total, items] = await this.prisma.$transaction([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ timestamp: 'desc' }, { id: 'desc' }],
        include: {
          location: {
            include: {
              taxRateRegion: {
                include: {
                  jurisdictions: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async importOrders(csvContent: string): Promise<ImportOrdersResult> {
    await this.ensureBootstrap();

    if (!csvContent.trim()) {
      throw new BadRequestException('CSV file is empty');
    }

    const rows = csvContent
      .split(/\r?\n/)
      .map((line, index) => ({ line: line.trim(), lineNumber: index + 1 }))
      .filter((entry) => entry.line.length > 0);

    if (rows.length === 0) {
      throw new BadRequestException('CSV file is empty');
    }

    let firstDataRowIndex = 0;
    const firstRow = this.splitCsvLine(rows[0].line);
    if (firstRow && this.isCsvHeader(firstRow)) {
      firstDataRowIndex = 1;
    }

    const errors: ImportOrderRowError[] = [];
    let imported = 0;
    let processed = 0;

    for (let i = firstDataRowIndex; i < rows.length; i += 1) {
      const { line, lineNumber } = rows[i];
      processed += 1;

      const rowDto = this.splitCsvLine(line);
      if (!rowDto) {
        errors.push({
          line: lineNumber,
          message: 'Invalid row format. Expected 5 columns: id,longitude,latitude,timestamp,subtotal',
        });
        continue;
      }

      const dtoWithGeneratedId = { ...rowDto, id: randomUUID() };

      try {
        await this.createOrderInternal(dtoWithGeneratedId, true);
        imported += 1;
      } catch (error) {
        errors.push({
          line: lineNumber,
          id: dtoWithGeneratedId.id,
          message: this.toErrorMessage(error),
        });
      }
    }

    return {
      processed,
      imported,
      failed: errors.length,
      errors,
    };
  }

  private async createOrderInternal(
    payload: CreateOrderDto,
    requireId: boolean,
  ): Promise<OrderWithLocation> {
    const orderId = this.parseOptionalString(payload.id, 'id');
    if (requireId && !orderId) {
      throw new BadRequestException('id is required');
    }

    const longitude = this.parseCoordinate(payload.longitude, 'longitude', -180, 180);
    const latitude = this.parseCoordinate(payload.latitude, 'latitude', -90, 90);
    const timestamp = this.parseDate(payload.timestamp, 'timestamp');
    const subtotal = this.parseNumber(payload.subtotal, 'subtotal');

    if (subtotal < 0) {
      throw new BadRequestException('subtotal must be greater than or equal to 0');
    }

    const county = this.resolveCountyByPoint(longitude, latitude);
    if (!county) {
      throw new BadRequestException('Coordinates are outside New York county boundaries');
    }

    const taxRateRegion = this.taxRegionsByCounty.get(county.normalizedCountyName);
    if (!taxRateRegion) {
      throw new NotFoundException(`Tax rate region is not configured for ${county.countyName}`);
    }

    const taxAmount = this.roundCurrency(subtotal * taxRateRegion.composite_rate);
    const totalAmount = this.roundCurrency(subtotal + taxAmount);

    try {
      return await this.prisma.order.create({
        data: {
          ...(orderId ? { id: orderId } : {}),
          subtotal: this.toMoneyDecimal(subtotal),
          tax_amount: this.toMoneyDecimal(taxAmount),
          total_amount: this.toMoneyDecimal(totalAmount),
          timestamp,
          location: {
            create: {
              latitude,
              longitude,
              taxRateRegionId: taxRateRegion.id,
            },
          },
        },
        include: {
          location: {
            include: {
              taxRateRegion: {
                include: {
                  jurisdictions: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException(`Order with id "${orderId}" already exists`);
      }
      throw error;
    }
  }

  private async ensureBootstrap() {
    if (this.bootstrapPromise) {
      await this.bootstrapPromise;
      return;
    }

    this.bootstrapPromise = this.bootstrap();
    await this.bootstrapPromise;
  }

  private async bootstrap() {
    const geoJsonFile = await this.readOrdersAsset('new-york-counties.geojson');
    this.countyFeatures = this.parseCountyFeatures(geoJsonFile);

    const taxesPdf = await this.readOrdersAssetBufferOptional('pub718.pdf');
    let taxRates: TaxRateDataset;

    if (taxesPdf) {
      try {
        const fromPdf = await this.parseTaxDatasetFromPdf(taxesPdf);
        const normalizedFromPdf = new Set(
          Object.keys(fromPdf).map((k) => this.normalizeCountyName(k)),
        );
        const allCountiesCovered = this.countyFeatures.every((c) =>
          normalizedFromPdf.has(c.normalizedCountyName),
        );
        if (allCountiesCovered) {
          taxRates = fromPdf;
        } else {
          taxRates = this.parseTaxDataset(await this.readOrdersAsset('taxes.json'));
        }
      } catch {
        taxRates = this.parseTaxDataset(await this.readOrdersAsset('taxes.json'));
      }
    } else {
      taxRates = this.parseTaxDataset(await this.readOrdersAsset('taxes.json'));
    }

    await this.syncTaxRateRegions(taxRates);
  }

  private async syncTaxRateRegions(taxRates: TaxRateDataset) {
    const existingRegions = await this.prisma.taxRateRegion.findMany({
      include: {
        jurisdictions: true,
      },
    });
    const existingByName = new Map(existingRegions.map((region) => [region.name, region]));
    const updatedTaxRegionsByCounty = new Map<string, TaxRateRegionWithJurisdictions>();

    for (const [countyName, taxRate] of Object.entries(taxRates)) {
      const trimmedCountyName = countyName.trim();
      const cityRate = this.roundRate(
        taxRate.composite_rate - taxRate.state_rate - taxRate.county_rate - taxRate.special_rate,
      );
      const normalizedCityRate = Math.max(0, cityRate);
      const jurisdictions = this.buildJurisdictions(trimmedCountyName, {
        ...taxRate,
        city_rate: normalizedCityRate,
      });

      const regionPayload = {
        name: trimmedCountyName,
        composite_rate: taxRate.composite_rate,
        state_rate: taxRate.state_rate,
        county_rate: taxRate.county_rate,
        city_rate: normalizedCityRate,
        special_rate: taxRate.special_rate,
      };

      const existing = existingByName.get(trimmedCountyName);
      const savedRegion = existing
        ? await this.prisma.taxRateRegion.update({
            where: { id: existing.id },
            data: {
              ...regionPayload,
              jurisdictions: {
                deleteMany: {},
                create: jurisdictions.map((jurisdiction) => ({
                  name: jurisdiction.name,
                  type: jurisdiction.type,
                  rate: jurisdiction.rate,
                })),
              },
            },
            include: {
              jurisdictions: true,
            },
          })
        : await this.prisma.taxRateRegion.create({
            data: {
              ...regionPayload,
              jurisdictions: {
                create: jurisdictions.map((jurisdiction) => ({
                  name: jurisdiction.name,
                  type: jurisdiction.type,
                  rate: jurisdiction.rate,
                })),
              },
            },
            include: {
              jurisdictions: true,
            },
          });

      updatedTaxRegionsByCounty.set(this.normalizeCountyName(trimmedCountyName), savedRegion);
    }

    this.taxRegionsByCounty = updatedTaxRegionsByCounty;
  }

  private buildJurisdictions(
    countyName: string,
    rates: TaxRateRaw & { city_rate: number },
  ): JurisdictionDto[] {
    const jurisdictions: JurisdictionDto[] = [
      {
        name: 'New York State',
        type: 'state',
        rate: this.roundRate(rates.state_rate),
      },
      {
        name: `${countyName} County`,
        type: 'county',
        rate: this.roundRate(rates.county_rate),
      },
    ];

    if (rates.city_rate > 0) {
      jurisdictions.push({
        name: `${countyName} City`,
        type: 'city',
        rate: this.roundRate(rates.city_rate),
      });
    }

    if (rates.special_rate > 0) {
      jurisdictions.push({
        name: 'Metropolitan Commuter Transportation District',
        type: 'special',
        rate: this.roundRate(rates.special_rate),
      });
    }

    return jurisdictions;
  }

  private async extractPublication718Text(buffer: Buffer): Promise<string> {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }
  
  private shouldSkipPublication718Line(line: string): boolean {
    return (
      /^Publication 718/i.test(line) ||
      /^\(\d+\/\d+\)$/i.test(line) ||
      /^New York State Sales and Use Tax/i.test(line) ||
      /^Rates by Jurisdiction/i.test(line) ||
      /^Effective March/i.test(line) ||
      /^The following list includes/i.test(line) ||
      /^with any county/i.test(line) ||
      /^and the reporting codes/i.test(line) ||
      /^New York City comprises/i.test(line) ||
      /^are also boroughs/i.test(line) ||
      /^known\./i.test(line) ||
      /^The counties,/i.test(line) ||
      /^Reporting codes,/i.test(line) ||
      /^used for identifying/i.test(line) ||
      /^\(Postal zones/i.test(line) ||
      /^the use of ZIP codes/i.test(line) ||
      /^degree of inaccurate/i.test(line) ||
      /^Jurisdiction and Rate Lookup/i.test(line) ||
      /^at www\.tax\.ny\.gov/i.test(line) ||
      /^jurisdiction,/i.test(line) ||
      /^and the local jurisdictional/i.test(line) ||
      /^filing New York State/i.test(line) ||
      /^For sales tax rates previously/i.test(line) ||
      /^Publication 718-A/i.test(line) ||
      /^Any items changed/i.test(line) ||
      /^boldface italics\./i.test(line) ||
      /^County or/i.test(line) ||
      /^Tax rate/i.test(line) ||
      /^Reporting code/i.test(line) ||
      /^\*Rates in these jurisdictions include/i.test(line) ||
      /^\/8% imposed/i.test(line) ||
      /^New York State only\s+/i.test(line)
    );
  }
  
  private cleanPublicationCountyLabel(value: string): string {
    return value
      .replace(/^\*/, '')
      .replace(/\s*\([^)]*\)\s*/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  private parsePublicationRate(rawRate: string): number {
    const normalized = rawRate.replace(/\s+/g, '');
  
    const unicodeFractions: Record<string, number> = {
      '⅛': 0.125,
      '¼': 0.25,
      '⅜': 0.375,
      '½': 0.5,
      '⅝': 0.625,
      '¾': 0.75,
      '⅞': 0.875,
    };
  
    const unicodeMatch = normalized.match(/^(\d+)([⅛¼⅜½⅝¾⅞])?$/u);
    if (unicodeMatch) {
      const whole = Number(unicodeMatch[1]);
      const fraction = unicodeMatch[2] ? unicodeFractions[unicodeMatch[2]] : 0;
      return this.roundRate((whole + fraction) / 100);
    }
  
    const asciiMatch = rawRate.trim().match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (asciiMatch) {
      const whole = Number(asciiMatch[1]);
      const numerator = Number(asciiMatch[2]);
      const denominator = Number(asciiMatch[3]);
  
      if (denominator === 0) {
        throw new Error(`Invalid rate fraction: ${rawRate}`);
      }
  
      return this.roundRate((whole + numerator / denominator) / 100);
    }
  
    throw new Error(`Unable to parse tax rate "${rawRate}" from pub718.pdf`);
  }

  private parseTaxDataset(raw: string): TaxRateDataset {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error('Unable to parse taxes.json');
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid taxes.json structure');
    }

    return parsed as TaxRateDataset;
  }

  private async parseTaxDatasetFromPdf(raw: Buffer): Promise<TaxRateDataset> {
    const text = await this.extractPublication718Text(raw);
  
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim())
      .filter(Boolean);
  
    const stateRate = 0.04;
    const mctdRate = 0.00375;
  
    const boroughCountyNames = new Set(['bronx', 'kings', 'new york', 'queens', 'richmond']);
    const mctdCounties = new Set([
      'bronx',
      'kings',
      'new york',
      'queens',
      'richmond',
      'dutchess',
      'nassau',
      'orange',
      'putnam',
      'rockland',
      'suffolk',
      'westchester',
    ]);
  
    const parsedRates = new Map<string, { displayName: string; compositeRate: number }>();
    let newYorkCityCompositeRate: number | null = null;
  
    for (const line of lines) {
      if (this.shouldSkipPublication718Line(line)) {
        continue;
      }
  
      if (/\(city\)/i.test(line)) {
        continue;
      }
  
      if (/see\s+New York City/i.test(line)) {
        const aliasRaw = line.split(/\s+[—–-]\s+see\s+New York City/i)[0] ?? '';
        const aliasDisplayName = this.cleanPublicationCountyLabel(aliasRaw);
        const aliasNormalized = this.normalizeCountyName(aliasDisplayName);
  
        if (boroughCountyNames.has(aliasNormalized)) {
          parsedRates.set(aliasNormalized, {
            displayName: aliasDisplayName,
            compositeRate: -1, // тимчасово, нижче підставимо NYC rate
          });
        }
  
        continue;
      }
  
      const rowMatch = line.match(
        /^\*?(.+?)(?:\s+[—–-]\s+except)?\s+([0-9]+(?:[⅛¼⅜½⅝¾⅞]|\s+\d+\/\d+)?)\s+\d{4}$/u,
      );
  
      if (!rowMatch) {
        continue;
      }
  
      const rawName = rowMatch[1];
      const rawRate = rowMatch[2];
  
      const displayName = this.cleanPublicationCountyLabel(rawName);
      const normalizedCountyName = this.normalizeCountyName(displayName);
      const compositeRate = this.parsePublicationRate(rawRate);
  
      if (normalizedCountyName === 'new york city') {
        newYorkCityCompositeRate = compositeRate;
        continue;
      }
  
      // Ігноруємо borough aliases типу Brooklyn / Manhattan / Staten Island,
      // якщо вони раптом трапились як окремі рядки.
      if (['brooklyn', 'manhattan', 'staten island'].includes(normalizedCountyName)) {
        continue;
      }
  
      parsedRates.set(normalizedCountyName, {
        displayName,
        compositeRate,
      });
    }
  
    if (newYorkCityCompositeRate === null) {
      throw new Error('Unable to find "New York City" rate in pub718.pdf');
    }
  
    for (const countyName of ['Bronx', 'Kings', 'New York', 'Queens', 'Richmond']) {
      parsedRates.set(this.normalizeCountyName(countyName), {
        displayName: countyName,
        compositeRate: newYorkCityCompositeRate,
      });
    }
  
    const result: TaxRateDataset = {};
  
    for (const [normalizedCountyName, entry] of parsedRates.entries()) {
      if (entry.compositeRate < 0) {
        entry.compositeRate = newYorkCityCompositeRate;
      }
  
      const specialRate = mctdCounties.has(normalizedCountyName) ? mctdRate : 0;
      const countyRate = this.roundRate(entry.compositeRate - stateRate - specialRate);
  
      result[entry.displayName] = {
        composite_rate: this.roundRate(entry.compositeRate),
        state_rate: stateRate,
        county_rate: countyRate,
        special_rate: specialRate,
      };
    }
  
    return result;
  }

  private getOrdersAssetPaths(fileName: string): string[] {
    return [
      join(__dirname, ORDERS_ASSETS_DIR, fileName),
      join(process.cwd(), 'src', 'orders', ORDERS_ASSETS_DIR, fileName),
      join(process.cwd(), 'apps', 'api', 'src', 'orders', ORDERS_ASSETS_DIR, fileName),
    ];
  }

  private async readOrdersAssetBuffer(fileName: string) {
    for (const location of this.getOrdersAssetPaths(fileName)) {
      try {
        return await readFile(location);
      } catch {
        // Try the next known location.
      }
    }

    throw new Error(`Unable to locate ${fileName}`);
  }

  private async readOrdersAssetBufferOptional(fileName: string): Promise<Buffer | null> {
    const locations = this.getOrdersAssetPaths(fileName);

    for (const location of locations) {
      try {
        return await readFile(location);
      } catch {
        // Try the next known location.
      }
    }

    return null;
  }

  private parseCountyFeatures(raw: string): CountyFeature[] {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error('Unable to parse new-york-counties.geojson');
    }

    const geoData = parsed as GeoJsonFeatureCollection;
    if (!geoData?.features || !Array.isArray(geoData.features)) {
      throw new Error('Invalid GeoJSON structure');
    }

    return geoData.features.map((feature) => {
      const countyName = feature.properties?.name?.replace(/\s+County$/i, '').trim();
      if (!countyName) {
        throw new Error('GeoJSON feature is missing county name');
      }

      const polygons: MultiPolygonCoordinates =
        feature.geometry.type === 'Polygon'
          ? [feature.geometry.coordinates as PolygonCoordinates]
          : (feature.geometry.coordinates as MultiPolygonCoordinates);

      return {
        countyName,
        normalizedCountyName: this.normalizeCountyName(countyName),
        polygons,
        bbox: this.calculateBoundingBox(polygons),
      };
    });
  }

  private resolveCountyByPoint(longitude: number, latitude: number): CountyFeature | null {
    for (const countyFeature of this.countyFeatures) {
      if (!this.isPointInsideBoundingBox(longitude, latitude, countyFeature.bbox)) {
        continue;
      }

      for (const polygon of countyFeature.polygons) {
        if (this.isPointInPolygon(longitude, latitude, polygon)) {
          return countyFeature;
        }
      }
    }

    return null;
  }

  private isPointInsideBoundingBox(
    longitude: number,
    latitude: number,
    bbox: CountyFeature['bbox'],
  ) {
    return (
      longitude >= bbox.minLng &&
      longitude <= bbox.maxLng &&
      latitude >= bbox.minLat &&
      latitude <= bbox.maxLat
    );
  }

  private isPointInPolygon(longitude: number, latitude: number, polygon: PolygonCoordinates) {
    const [outerRing, ...holes] = polygon;

    if (!this.isPointInRing(longitude, latitude, outerRing)) {
      return false;
    }

    for (const hole of holes) {
      if (this.isPointInRing(longitude, latitude, hole)) {
        return false;
      }
    }

    return true;
  }

  private isPointInRing(longitude: number, latitude: number, ring: Position[]) {
    let inside = false;

    for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
      const [x1, y1] = ring[i];
      const [x2, y2] = ring[j];

      const intersects =
        y1 > latitude !== y2 > latitude &&
        longitude < ((x2 - x1) * (latitude - y1)) / (y2 - y1 + Number.EPSILON) + x1;

      if (intersects) {
        inside = !inside;
      }
    }

    return inside;
  }

  private calculateBoundingBox(polygons: MultiPolygonCoordinates) {
    let minLng = Number.POSITIVE_INFINITY;
    let maxLng = Number.NEGATIVE_INFINITY;
    let minLat = Number.POSITIVE_INFINITY;
    let maxLat = Number.NEGATIVE_INFINITY;

    for (const polygon of polygons) {
      for (const ring of polygon) {
        for (const [lng, lat] of ring) {
          minLng = Math.min(minLng, lng);
          maxLng = Math.max(maxLng, lng);
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
        }
      }
    }

    return { minLng, maxLng, minLat, maxLat };
  }

  private normalizeCountyName(name: string) {
    return name
      .toLowerCase()
      .replace(/\bcounty\b/gi, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  private parseCoordinate(
    value: string | number,
    label: string,
    minAllowed: number,
    maxAllowed: number,
  ) {
    const parsed = this.parseNumber(value, label);
    if (parsed < minAllowed || parsed > maxAllowed) {
      throw new BadRequestException(
        `${label} must be between ${minAllowed} and ${maxAllowed}`,
      );
    }
    return parsed;
  }

  private parseDate(value: string, label: string) {
    const timestamp = new Date(value);
    if (Number.isNaN(timestamp.getTime())) {
      throw new BadRequestException(`${label} must be a valid ISO timestamp`);
    }

    return timestamp;
  }

  private parseInteger(
    value: string | undefined,
    label: string,
    defaultValue: number,
    min: number,
    max?: number,
  ) {
    if (value === undefined || value === null || value === '') {
      return defaultValue;
    }

    if (!/^-?\d+$/.test(value.trim())) {
      throw new BadRequestException(`${label} must be an integer`);
    }

    const parsed = Number.parseInt(value, 10);
    if (parsed < min) {
      throw new BadRequestException(`${label} must be greater than or equal to ${min}`);
    }
    if (max !== undefined && parsed > max) {
      throw new BadRequestException(`${label} must be less than or equal to ${max}`);
    }
    return parsed;
  }

  private parseNumber(value: string | number, label: string) {
    if (typeof value === 'string' && value.trim() === '') {
      throw new BadRequestException(`${label} must be a valid number`);
    }

    const normalized = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(normalized)) {
      throw new BadRequestException(`${label} must be a valid number`);
    }
    return normalized;
  }

  private parseOptionalString(value: string | undefined, label: string) {
    if (value === undefined || value === null) {
      return undefined;
    }
    const normalized = value.trim();
    if (!normalized) {
      throw new BadRequestException(`${label} cannot be empty`);
    }
    return normalized;
  }

  private roundCurrency(value: number) {
    return Number(value.toFixed(2));
  }

  private roundRate(value: number) {
    return Number(value.toFixed(6));
  }

  private toMoneyDecimal(value: number) {
    return new Prisma.Decimal(value.toFixed(2));
  }

  /**
   * Parses a CSV line into CreateOrderDto (string values).
   * Returns null if the line does not have exactly 5 columns.
   */
  private splitCsvLine(line: string): CreateOrderDto | null {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 1;
          continue;
        }

        inQuotes = !inQuotes;
        continue;
      }

      if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
        continue;
      }

      current += char;
    }

    if (inQuotes) {
      throw new BadRequestException('Invalid CSV: unclosed quote');
    }

    values.push(current);

    if (values.length !== 5) {
      return null;
    }

    const [id, longitude, latitude, timestamp, subtotal] = values.map((v) => v.trim());
    return { id, longitude: Number(longitude), latitude: Number(latitude), timestamp, subtotal: Number(subtotal) };
  }

  private isCsvHeader(row: CreateOrderDto) {
    const id = (row.id ?? '').toLowerCase();
    const longitude = String(row.longitude ?? '').toLowerCase();
    const latitude = String(row.latitude ?? '').toLowerCase();
    const timestamp = String(row.timestamp ?? '').toLowerCase();
    const subtotal = String(row.subtotal ?? '').toLowerCase();
    return (
      id === 'id' &&
      longitude === 'longitude' &&
      latitude === 'latitude' &&
      timestamp === 'timestamp' &&
      subtotal === 'subtotal'
    );
  }

  private isUniqueConstraintError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
  }

  private toErrorMessage(error: unknown) {
    if (error instanceof Error) {
      return error.message;
    }
    return 'Unexpected error';
  }

  private async readOrdersAsset(fileName: string) {
    for (const location of this.getOrdersAssetPaths(fileName)) {
      try {
        return await readFile(location, 'utf8');
      } catch {
        // Try the next known location.
      }
    }

    throw new Error(`Unable to locate ${fileName}`);
  }
}
