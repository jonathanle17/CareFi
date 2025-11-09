import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { Recommendation } from '@/lib/types';

/**
 * GET /api/recommendations
 *
 * Returns product recommendations filtered by:
 * - skin_concerns (query param: comma-separated)
 * - budget range (query params: min, max)
 * - ingredients_to_avoid (from onboarding_data)
 *
 * Query params:
 * - concerns: string (e.g., "acne,oily")
 * - min: number (e.g., 50)
 * - max: number (e.g., 150)
 *
 * MOCK IMPLEMENTATION:
 * - Currently returns sample product data
 * - Replace with real products table query later
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const concernsParam = searchParams.get('concerns');
    const minParam = searchParams.get('min');
    const maxParam = searchParams.get('max');

    const concernsFilter = concernsParam
      ? concernsParam.split(',').map((c) => c.trim().toLowerCase())
      : [];
    const minPrice = minParam ? parseFloat(minParam) : 0;
    const maxPrice = maxParam ? parseFloat(maxParam) : Infinity;

    // Get user's onboarding data for ingredients_to_avoid
    const { data: onboarding } = await supabase
      .from('onboarding_data')
      .select('ingredients_to_avoid, ingredients_to_avoid_array')
      .eq('user_id', user.id)
      .single();

    const ingredientsToAvoid = (
      onboarding?.ingredients_to_avoid_array || []
    ).map((ing: string) => ing.toLowerCase());

    // TODO: Replace with real products query
    // const { data: products, error } = await supabase
    //   .from('products')
    //   .select('*')
    //   .gte('price_usd', minPrice)
    //   .lte('price_usd', maxPrice)
    //   .eq('is_active', true);

    // MOCK DATA: Sample products
    const mockProducts: Recommendation[] = [
      {
        id: '1',
        name: 'CeraVe Foaming Facial Cleanser',
        concern_tags: ['acne', 'oily'],
        key_ingredients: ['Ceramides', 'Niacinamide', 'Hyaluronic Acid'],
        price_usd: 14.99,
        retail_usd: 19.99,
        vendor: 'amazon',
        url: 'https://amazon.com/dp/B01N1LL62W',
      },
      {
        id: '2',
        name: 'The Ordinary Niacinamide 10% + Zinc 1%',
        concern_tags: ['acne', 'oily', 'pores'],
        key_ingredients: ['Niacinamide', 'Zinc PCA'],
        price_usd: 6.99,
        retail_usd: 8.99,
        vendor: 'sephora',
        url: 'https://sephora.com/product/P442959',
      },
      {
        id: '3',
        name: 'Cosrx Advanced Snail 96 Mucin Power Essence',
        concern_tags: ['dryness', 'sensitive'],
        key_ingredients: ['Snail Mucin', 'Sodium Hyaluronate'],
        price_usd: 24.99,
        retail_usd: 28.99,
        vendor: 'yesstyle',
        url: 'https://yesstyle.com/en/cosrx-advanced-snail-96-mucin-power-essence-100ml/info.html',
      },
      {
        id: '4',
        name: 'La Roche-Posay Effaclar Duo',
        concern_tags: ['acne', 'pigmentation'],
        key_ingredients: ['Salicylic Acid', 'LHA', 'Niacinamide'],
        price_usd: 21.99,
        retail_usd: 29.99,
        vendor: 'amazon',
        url: 'https://amazon.com/dp/B00EYXUA0Q',
      },
      {
        id: '5',
        name: 'Paula\'s Choice 2% BHA Liquid Exfoliant',
        concern_tags: ['acne', 'oily', 'pores'],
        key_ingredients: ['Salicylic Acid', 'Green Tea Extract'],
        price_usd: 32.99,
        retail_usd: 39.99,
        vendor: 'sephora',
        url: 'https://sephora.com/product/P452214',
      },
      {
        id: '6',
        name: 'Cetaphil Daily Facial Moisturizer SPF 50',
        concern_tags: ['sensitive', 'dryness'],
        key_ingredients: ['Zinc Oxide', 'Glycerin', 'Vitamin E'],
        price_usd: 16.99,
        retail_usd: 19.99,
        vendor: 'amazon',
        url: 'https://amazon.com/dp/B07DQH36Q3',
      },
      {
        id: '7',
        name: 'SOME BY MI AHA BHA PHA 30 Days Miracle Toner',
        concern_tags: ['acne', 'oily', 'pigmentation'],
        key_ingredients: ['AHA', 'BHA', 'PHA', 'Tea Tree Extract'],
        price_usd: 19.99,
        retail_usd: 24.99,
        vendor: 'yesstyle',
        url: 'https://yesstyle.com/en/some-by-mi-aha-bha-pha-30-days-miracle-toner-150ml/info.html',
      },
      {
        id: '8',
        name: 'Neutrogena Hydro Boost Water Gel',
        concern_tags: ['dryness', 'sensitive'],
        key_ingredients: ['Hyaluronic Acid', 'Glycerin'],
        price_usd: 18.99,
        retail_usd: 22.99,
        vendor: 'amazon',
        url: 'https://amazon.com/dp/B00NR1YQHM',
      },
      {
        id: '9',
        name: 'The Inkey List Retinol Serum',
        concern_tags: ['aging', 'pigmentation'],
        key_ingredients: ['Retinol', 'Squalane'],
        price_usd: 12.99,
        retail_usd: 14.99,
        vendor: 'sephora',
        url: 'https://sephora.com/product/P447159',
      },
      {
        id: '10',
        name: 'EltaMD UV Clear Broad-Spectrum SPF 46',
        concern_tags: ['acne', 'sensitive'],
        key_ingredients: ['Zinc Oxide', 'Niacinamide'],
        price_usd: 39.99,
        retail_usd: 44.99,
        vendor: 'sephora',
        url: 'https://sephora.com/product/P480634',
      },
      {
        id: '11',
        name: 'Klairs Freshly Juiced Vitamin C Serum',
        concern_tags: ['pigmentation', 'dullness'],
        key_ingredients: ['Ascorbic Acid', 'Centella Asiatica'],
        price_usd: 23.99,
        retail_usd: 27.99,
        vendor: 'yesstyle',
        url: 'https://yesstyle.com/en/klairs-freshly-juiced-vitamin-drop-35ml/info.html',
      },
      {
        id: '12',
        name: 'Differin Adapalene Gel 0.1%',
        concern_tags: ['acne', 'oily'],
        key_ingredients: ['Adapalene'],
        price_usd: 14.49,
        retail_usd: 16.99,
        vendor: 'amazon',
        url: 'https://amazon.com/dp/B07179NW7K',
      },
    ];

    // Filter by concerns
    let filtered = mockProducts;
    if (concernsFilter.length > 0) {
      filtered = filtered.filter((product) =>
        product.concern_tags.some((tag) =>
          concernsFilter.includes(tag.toLowerCase())
        )
      );
    }

    // Filter by budget
    filtered = filtered.filter(
      (product) => product.price_usd >= minPrice && product.price_usd <= maxPrice
    );

    // Filter out products with avoided ingredients
    if (ingredientsToAvoid.length > 0) {
      filtered = filtered.filter((product) =>
        !product.key_ingredients.some((ing) =>
          ingredientsToAvoid.some((avoid) =>
            ing.toLowerCase().includes(avoid)
          )
        )
      );
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('[API] /api/recommendations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
