/**
 * Windows API Endpoint
 * 
 * Provides transfer window metadata for frontend consumption.
 * Supports fetching specific window details or all recent windows.
 * 
 * Tech Spec §2.7: Window Metadata API
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  getWindowMetadata, 
  getRecentWindows, 
  getCurrentWindow,
  isValidWindowId,
  parseWindowId 
} from '../../../lib/utils/window-detection';
import { TransferWindow } from '../../../lib/config/transfer-windows';

// Query parameter schema
const WindowsQuerySchema = z.object({
  id: z.string().optional(),
  league: z.string().optional(),
});

/**
 * GET /api/windows
 * 
 * Fetches transfer window metadata.
 * 
 * Query Parameters:
 * - id: Optional window ID (e.g., "2025-winter")
 * - league: Optional league ID for league-specific windows
 * 
 * Responses:
 * - 200: Window metadata(s)
 * - 400: Invalid window ID
 * - 500: Server error
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const queryParams = WindowsQuerySchema.safeParse({
      id: searchParams.get('id'),
      league: searchParams.get('league'),
    });
    
    if (!queryParams.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid query parameters',
          details: queryParams.error.issues 
        },
        { status: 400 }
      );
    }
    
    const { id, league } = queryParams.data;
    
    // If specific window ID requested
    if (id) {
      // Validate window ID format
      if (!isValidWindowId(id)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid window ID format. Expected format: YYYY-winter or YYYY-summer' 
          },
          { status: 400 }
        );
      }
      
      // Get window metadata (league-specific if league provided)
      const metadata = getWindowMetadata(id, league);
      
      if (!metadata) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Window not found' 
          },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: metadata,
      });
    }
    
    // Return all recent windows (current year and previous year)
    const recentWindows = getRecentWindows();
    const currentWindow = getCurrentWindow();
    
    // If league specified, get league-specific metadata for each window
    if (league) {
      const leagueSpecificWindows = recentWindows.map(window => 
        getWindowMetadata(window.id, league)
      ).filter((window): window is TransferWindow => window !== null);
      
      return NextResponse.json({
        success: true,
        data: {
          windows: leagueSpecificWindows,
          current: currentWindow,
          league,
          count: leagueSpecificWindows.length,
        },
      });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        windows: recentWindows,
        current: currentWindow,
        count: recentWindows.length,
      },
    });
    
  } catch (error) {
    console.error('Windows API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/windows
 * 
 * Creates or updates transfer window metadata (admin functionality).
 * 
 * Request Body:
 * - window: Window object with metadata
 * 
 * Responses:
 * - 201: Window created/updated
 * - 400: Invalid request data
 * - 500: Server error
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const WindowCreateSchema = z.object({
      id: z.string().regex(/^\d{4}-(winter|summer)$/),
      name: z.string().min(1),
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
      status: z.enum(['open', 'closed']),
      leagues: z.array(z.string()).optional(),
    });
    
    const validationResult = WindowCreateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request body',
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }
    
    // In a real implementation, this would save to database
    // For now, just return success with the validated data
    const windowData = validationResult.data;
    
    return NextResponse.json({
      success: true,
      data: {
        ...windowData,
        startDate: new Date(windowData.startDate),
        endDate: new Date(windowData.endDate),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    
  } catch (error) {
    console.error('Windows POST API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
