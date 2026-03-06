Add-Type -AssemblyName System.Drawing

$sourcePath = "c:\Users\julio\Documents\01-Meus Sites\star-bella\public\logo.png"
$androidPath = "c:\Users\julio\Documents\01-Meus Sites\star-bella\android\app\src\main\res"

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

    if (-not (Test-Path $outFolder)) {
        Write-Host "Pasta nao encontrada: $outFolder (pulando)"
        continue
    }

    $dest = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($source, 0, 0, $size, $size)
    $g.Dispose()

    $dest.Save((Join-Path $outFolder "ic_launcher.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $dest.Save((Join-Path $outFolder "ic_launcher_round.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $dest.Dispose()

    Write-Host "Gerado $folder - ${size}x${size}"
}

$source.Dispose()
Write-Host ""
Write-Host "Pronto! Todos os icones gerados com sucesso."
