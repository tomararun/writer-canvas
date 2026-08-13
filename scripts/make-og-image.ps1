Add-Type -AssemblyName System.Drawing

$w = 1200; $h = 630
$bmp = New-Object System.Drawing.Bitmap($w, $h)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

# Palette matched to the site tokens (warm paper, warm ink, russet primary)
$paper = [System.Drawing.Color]::FromArgb(248, 245, 239)
$ink = [System.Drawing.Color]::FromArgb(53, 50, 44)
$muted = [System.Drawing.Color]::FromArgb(122, 116, 104)
$russet = [System.Drawing.Color]::FromArgb(122, 68, 52)

$g.Clear($paper)

$brushInk = New-Object System.Drawing.SolidBrush($ink)
$brushMuted = New-Object System.Drawing.SolidBrush($muted)
$brushRusset = New-Object System.Drawing.SolidBrush($russet)
$penRule = New-Object System.Drawing.Pen($russet, 3)

$fontEyebrow = New-Object System.Drawing.Font("Segoe UI", 22, [System.Drawing.FontStyle]::Bold)
$fontTitle = New-Object System.Drawing.Font("Georgia", 82, [System.Drawing.FontStyle]::Regular)
$fontTagline = New-Object System.Drawing.Font("Georgia", 30, [System.Drawing.FontStyle]::Italic)

$left = 96.0

# Top rule
$g.DrawLine($penRule, $left, 120, $left + 72, 120)

# Eyebrow (letterspaced by hand)
$dot = [string][char]0x00B7
$eyebrow = "E S S A Y S   $dot   C A S E  S T U D I E S   $dot   J O U R N A L"
$g.DrawString($eyebrow, $fontEyebrow, $brushRusset, $left - 4, 160)

# Title
$g.DrawString("Maya Ellsworth", $fontTitle, $brushInk, $left - 10, 230)

# Tagline
$tagline = "Essays on craft, attention, and the systems" + [Environment]::NewLine + "we build to think."
$g.DrawString($tagline, $fontTagline, $brushMuted, $left - 4, 390)

# Bottom rule
$g.DrawLine($penRule, $left, 540, $w - 96, 540)

$out = "e:\writer-canvas\public\og-default.png"
$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Output "saved: $out"
(Get-Item $out).Length
