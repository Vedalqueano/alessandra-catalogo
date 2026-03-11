Add-Type -AssemblyName System.Drawing

$sourcePath = Join-Path $PSScriptRoot "public\logo.png"
$androidPath = Join-Path $PSScriptRoot "android\app\src\main\res"
$androidPathFinal = Join-Path (Split-Path $PSScriptRoot -Parent) "star-bella\android\app\src\main\res"


$sizes = @{
    "mipmap-mdpi"    = 48
    "mipmap-hdpi"    = 72
    "mipmap-xhdpi"   = 96
    "mipmap-xxhdpi"  = 144
    "mipmap-xxxhdpi" = 192
}

Write-Host "Carregando logo: $sourcePath"
$source = [System.Drawing.Image]::FromFile($sourcePath)

foreach ($folder in $sizes.Keys) {
    $size = $sizes[$folder]
    $outFolder = Join-Path $androidPath $folder

    if (-not (Test-Path $outFolder)) { continue }
    
    $outFolderFinal = Join-Path $androidPathFinal $folder
    if (-not (Test-Path $outFolderFinal)) { continue }

    $dest = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    
    # Crop focado no círculo da logo para evitar bordas brancas e maximizar tamanho
    $targetCrop = 970
    $srcX = 55
    $srcY = 190
    
    $srcRect = New-Object System.Drawing.Rectangle($srcX, $srcY, $targetCrop, $targetCrop)
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    
    $g.DrawImage($source, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()

    $dest.Save((Join-Path $outFolder "ic_launcher.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $dest.Save((Join-Path $outFolder "ic_launcher_round.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    
    $dest.Save((Join-Path $outFolderFinal "ic_launcher.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $dest.Save((Join-Path $outFolderFinal "ic_launcher_round.png"), [System.Drawing.Imaging.ImageFormat]::Png)

    $dest.Dispose()

    Write-Host "Gerado $folder - ${size}x${size}"
}

$source.Dispose()
Write-Host ""
Write-Host "Pronto! Todos os icones gerados com sucesso nas duas pastas."

