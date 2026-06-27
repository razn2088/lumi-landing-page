import type { BrandsRepo } from "../db/repositories.js";
import { scanBrand, type ScanDeps, type ScanResult } from "./scan.js";

export interface BrandScan { brandId: string; brandName: string; result: ScanResult }

/**
 * Scan every active brand. A failure on one brand is logged and skipped so the
 * remaining brands still scan (one bad WordPress site can't stall the whole run).
 */
export async function scanAllActive(
  brands: BrandsRepo,
  deps: ScanDeps,
  log: (msg: string) => void = () => {},
): Promise<BrandScan[]> {
  const active = await brands.listActive();
  const out: BrandScan[] = [];
  for (const brand of active) {
    log(`Scanning ${brand.name} (${brand.wpApiBase}) ...`);
    try {
      const result = await scanBrand(brand, deps);
      log(`  ${brand.name}: scanned ${result.scanned}, inserted ${result.inserted}`);
      out.push({ brandId: brand.id, brandName: brand.name, result });
    } catch (e) {
      log(`  ${brand.name}: scan failed — ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  return out;
}
