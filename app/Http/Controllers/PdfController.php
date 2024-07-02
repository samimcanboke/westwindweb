<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;

class PdfController extends Controller
{
    public function downloadPdf($filename)
    {
        if(str_contains($filename, "pdf")){
            $filePath = storage_path('app/pdfs/' . $filename);
            if (Storage::exists('pdfs/' . $filename)) {
                return response()->file($filePath);
            } else {
                abort(404);
            }
        } else {
            $filePath = storage_path('app/excels/' . $filename);
            if (Storage::exists('excels/' . $filename)) {
                return response()->file($filePath);
            } else {
                abort(404);
            }
        }
    }
}
