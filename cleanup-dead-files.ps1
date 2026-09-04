<#
  cleanup-dead-files.ps1
  ----------------------
  Removes the dead components, old unused 3D models, and stray non-project
  files identified in AUDIT-UIUX-AI-SLOP.md (section 3). This session has no
  shell access to your computer, so this script does the deletions that
  Claude could not do directly.

  Safe to re-run: every deletion is guarded with a "does it exist?" check,
  so running it twice just reports "not found" the second time.

  Usage:
    1. Save this file anywhere (e.g. inside the lalsm folder).
    2. Open PowerShell.
    3. Run:  powershell -ExecutionPolicy Bypass -File .\cleanup-dead-files.ps1
       (or right-click -> Run with PowerShell)
    4. Review the printed list, then commit the deletions with git as usual.
#>

$ErrorActionPreference = "Stop"

# Project root — adjust if you saved/run this script from somewhere else.
$root = "E:\projek kecil-kecilan\lalsm"

if (-not (Test-Path $root)) {
    Write-Host "Project folder not found at '$root'." -ForegroundColor Red
    Write-Host "Edit the `$root variable at the top of this script to point at your lalsm folder, then re-run." -ForegroundColor Yellow
    exit 1
}

$filesToDelete = @(
    # --- Dead UI components (never imported anywhere) ---
    "components\ui\TechGraphSlide.tsx",
    "components\ui\ProjectEstimatorSlide.tsx",
    "components\ui\WireframePortal.tsx",
    "components\ui\AtmosphericWave.tsx",
    "components\ui\WorkflowKinetic.tsx",
    "components\ui\WorkflowSection.tsx",
    "components\ui\CreativeBlob.tsx",
    "components\ui\ScrollHint.tsx",
    "components\ui\ProgressLoader.tsx",
    "components\ui\AwwardsBadge.tsx",     # dead code that also links to someone else's portfolio — delete, don't reactivate
    "components\ui\ThemeSwitcher.tsx",    # duplicate/unused theme toggle — the real one lives in Navbar.tsx

    # --- Dead 3D model components (never imported anywhere) ---
    "components\models\Wanderer.tsx",
    "components\models\WindowModel.tsx",
    "components\models\Cloud.tsx",
    "components\models\Memory.tsx",
    "components\models\Stars.tsx",

    # --- Old/unused 3D model binaries (optimized versions already in use) ---
    "public\models\dalithe_persistence_of_memory-old.glb",
    "public\models\wanderer_above_the_sea_of_fog-old.glb",
    "public\models\window-old.glb",

    # --- Non-image / OS junk files that leaked into the public folder ---
    "public\images\certificates\SERTIFIKATs.docx",
    "public\images\certificates\KUMPULAN SERTIFIKAT.pdf",
    "public\images\certificates\desktop.ini"
)

$deleted = @()
$missing = @()

foreach ($rel in $filesToDelete) {
    $full = Join-Path $root $rel
    if (Test-Path -LiteralPath $full) {
        Remove-Item -LiteralPath $full -Force
        $deleted += $rel
        Write-Host "Deleted: $rel" -ForegroundColor Green
    } else {
        $missing += $rel
        Write-Host "Not found (already gone?): $rel" -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "Done. $($deleted.Count) file(s) deleted, $($missing.Count) not found." -ForegroundColor Cyan
Write-Host "The rest of the audit (config/copy/CSS fixes) was already applied directly to your files." -ForegroundColor Cyan
