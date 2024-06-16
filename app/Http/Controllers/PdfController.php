<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;

class PdfController extends Controller
{
    public function downloadPdf($filename)
    {
        $filePath = storage_path('app/pdfs/' . $filename);
        if (Storage::exists('pdfs/' . $filename)) {
            return response()->file($filePath);
        } else {
            abort(404);
        }
    }
}
