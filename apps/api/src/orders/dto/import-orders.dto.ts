export interface ImportOrderRowError {
  line: number;
  id?: string;
  message: string;
}

export interface ImportOrdersResult {
  processed: number;
  imported: number;
  failed: number;
  errors: ImportOrderRowError[];
}
