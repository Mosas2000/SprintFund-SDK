/**
 * Query builder for filtering and sorting data
 */

export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
export type SortDirection = 'asc' | 'desc';

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: any;
}

export interface SortCondition {
  field: string;
  direction: SortDirection;
}

export class QueryBuilder<T extends Record<string, any>> {
  private filters: FilterCondition[] = [];
  private sorts: SortCondition[] = [];
  private limitValue?: number;
  private offsetValue?: number;
  private selectFields?: string[];

  where(field: keyof T, operator: FilterOperator, value: any): this {
    this.filters.push({ field: String(field), operator, value });
    return this;
  }

  eq(field: keyof T, value: any): this { return this.where(field, 'eq', value); }
  ne(field: keyof T, value: any): this { return this.where(field, 'ne', value); }
  gt(field: keyof T, value: any): this { return this.where(field, 'gt', value); }
  gte(field: keyof T, value: any): this { return this.where(field, 'gte', value); }
  lt(field: keyof T, value: any): this { return this.where(field, 'lt', value); }
  lte(field: keyof T, value: any): this { return this.where(field, 'lte', value); }
  in(field: keyof T, values: any[]): this { return this.where(field, 'in', values); }
  contains(field: keyof T, value: string): this { return this.where(field, 'contains', value); }

  orderBy(field: keyof T, direction: SortDirection = 'asc'): this {
    this.sorts.push({ field: String(field), direction });
    return this;
  }

  limit(count: number): this {
    this.limitValue = count;
    return this;
  }

  offset(count: number): this {
    this.offsetValue = count;
    return this;
  }

  select(...fields: (keyof T)[]): this {
    this.selectFields = fields.map(String);
    return this;
  }

  execute(data: T[]): T[] {
    let result = [...data];

    // Apply filters
    for (const filter of this.filters) {
      result = result.filter(item => this.matchFilter(item, filter));
    }

    // Apply sorting
    for (const sort of this.sorts.reverse()) {
      result.sort((a, b) => {
        const aVal = a[sort.field];
        const bVal = b[sort.field];
        const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sort.direction === 'asc' ? cmp : -cmp;
      });
    }

    // Apply offset
    if (this.offsetValue) {
      result = result.slice(this.offsetValue);
    }

    // Apply limit
    if (this.limitValue) {
      result = result.slice(0, this.limitValue);
    }

    // Apply field selection
    if (this.selectFields) {
      result = result.map(item => {
        const selected: any = {};
        for (const field of this.selectFields!) {
          selected[field] = item[field];
        }
        return selected;
      });
    }

    return result;
  }

  private matchFilter(item: T, filter: FilterCondition): boolean {
    const value = item[filter.field];
    switch (filter.operator) {
      case 'eq': return value === filter.value;
      case 'ne': return value !== filter.value;
      case 'gt': return value > filter.value;
      case 'gte': return value >= filter.value;
      case 'lt': return value < filter.value;
      case 'lte': return value <= filter.value;
      case 'in': return Array.isArray(filter.value) && filter.value.includes(value);
      case 'contains': return String(value).includes(String(filter.value));
      default: return true;
    }
  }

  toJSON(): object {
    return {
      filters: this.filters,
      sorts: this.sorts,
      limit: this.limitValue,
      offset: this.offsetValue,
      select: this.selectFields,
    };
  }
}

export function createQuery<T extends Record<string, any>>(): QueryBuilder<T> {
  return new QueryBuilder<T>();
}
