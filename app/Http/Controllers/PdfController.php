<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;

class PdfController extends Controller
{
    public function downloadPdf($filename)
    {
        $filePath = storage_path('app/pdfs/' . $filename);
        
        // Dosya mevcut mu kontrol et
        if (Storage::exists('pdfs/' . $filename)) {
            return response()->download($filePath, $filename);
        } else {
            // Dosya bulunamadıysa 404 hatası döndür
            abort(404);
        }
    }
}
