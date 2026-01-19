/**
 * Transfer API Service
 * 
 * Centralized API client with type-safe methods for all transfer-related endpoints.
 * Provides error handling, request/response transformation, and caching integration.
 * 
 * @version 1.0
 * @since 2025-01-18
 */

import type {
  TransfersQueryParams,
  TransfersResponse,
  TopTransfersQueryParams,
  TopTransfersResponse,
  Transfer,
  TransferStatus,
  SummaryData
} from '@/types';
import {
  TransfersResponseSchema,
  SummaryDataSchema,
  TopTransfersResponseSchema,
  TransferSchema
} from '@/types';
import { z } from 'zod';

/**
 * API Error class for structured error handling
 */
export class TransferAPIError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'TransferAPIError';
  }
}

/**
 * Transfer API Service Class
 * 
 * Provides type-safe methods for all transfer-related API endpoints with
 * built-in error handling and response transformation.
 */
export class TransferAPIService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic request handler with error handling and schema validation
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    schema?: z.ZodSchema<T>
  ): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new TransferAPIError(
          response.status,
          `HTTP ${response.status}: ${response.statusText}`,
          {
            url,
            status: response.status,
            statusText: response.statusText,
            responseText: errorText,
          }
        );
      }

      const data = await response.json();
      
      // Validate with schema if provided
      if (schema) {
        const validationResult = schema.safeParse(data);
        if (!validationResult.success) {
          throw new TransferAPIError(
            0,
            'Response validation failed',
            {
              url,
              validationErrors: validationResult.error.issues,
              receivedData: data,
            }
          );
        }
        return validationResult.data;
      }
      
      return data;
    } catch (error) {
      if (error instanceof TransferAPIError) {
        throw error;
      }
      
      // Handle network errors, JSON parsing errors, etc.
      throw new TransferAPIError(
        0,
        error instanceof Error ? error.message : 'Unknown error occurred',
        { originalError: error }
      );
    }
  }

  /**
   * Build query string from parameters
   */
  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, item.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Fetch transfers with filtering and pagination
   */
  async fetchTransfers(params: TransfersQueryParams = {}): Promise<TransfersResponse> {
    const queryString = this.buildQueryString(params);
    const endpoint = `/transfers${queryString}`;
    
    const response = await this.makeRequest(endpoint, {}, TransfersResponseSchema);
    
    // Transform response data to ensure proper typing
    return {
      data: response.data?.map((transfer: any) => ({
        ...transfer,
        transferDate: new Date(transfer.transferDate),
        createdAt: new Date(transfer.createdAt),
        updatedAt: new Date(transfer.updatedAt),
      })) || [],
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || params.limit || 100,
      hasMore: response.hasMore || false,
    };
  }

  /**
   * Fetch summary data for dashboard
   */
  async fetchSummary(): Promise<SummaryData> {
    const response = await this.makeRequest('/summary', {}, SummaryDataSchema);
    
    // Transform response to ensure proper typing
    return {
      ...response,
      lastUpdated: response.lastUpdated || new Date().toISOString(),
    };
  }

  /**
   * Fetch top transfers by value
   */
  async fetchTopTransfers(params?: TopTransfersQueryParams): Promise<TopTransfersResponse> {
    const queryString = params ? this.buildQueryString(params) : '';
    const endpoint = `/top-transfers${queryString}`;
    
    const response = await this.makeRequest(endpoint, {}, TopTransfersResponseSchema);
    
    // Transform response data to ensure proper typing
    return {
      data: response.data?.map((transfer: any) => ({
        ...transfer,
        transferDate: new Date(transfer.transferDate),
      })) || [],
      window: response.window || 'current',
      totalInWindow: response.totalInWindow || response.data?.length || 0,
    };
  }

  /**
   * Fetch a single transfer by ID
   */
  async fetchTransferById(id: string): Promise<Transfer> {
    const response = await this.makeRequest(`/transfers/${id}`, {}, TransferSchema);
    
    // Transform response data to ensure proper typing
    return {
      ...response,
      transferDate: new Date(response.transferDate),
      createdAt: new Date(response.createdAt),
      updatedAt: new Date(response.updatedAt),
      status: 'done' as TransferStatus,
      window: `${new Date(response.transferDate).getFullYear()}-${new Date(response.transferDate).getMonth() < 6 ? 'summer' : 'winter'}` as `${number}-winter` | `${number}-summer`,
    };
  }

  /**
   * Health check for API availability
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; timestamp: string }> {
    try {
      await this.makeRequest('/summary');
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get API version information
   */
  async getApiVersion(): Promise<{ version: string; buildTime: string }> {
    try {
      return await this.makeRequest('/version');
    } catch (error) {
      // Fallback version if endpoint doesn't exist
      return {
        version: '1.0.0',
        buildTime: new Date().toISOString(),
      };
    }
  }
}

// Create singleton instance for application-wide use
export const transferAPI = new TransferAPIService();

// Export types for external use
// export type { TransferAPIService };
