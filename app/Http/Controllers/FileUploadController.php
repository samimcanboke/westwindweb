<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FileUploadController extends Controller
{
    public function upload(Request $request)
    {
        $uploadedFiles = [];
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $uniqueId = uniqid();
                $filename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $extension = $file->getClientOriginalExtension();
                $filename = str_replace(
                    [' ', 'ç', 'ğ', 'ı', 'ö', 'ş', 'ü', 'Ç', 'Ğ', 'İ', 'Ö', 'Ş', 'Ü', 'ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü', 'é', 'è', 'ê', 'à', 'â', 'î', 'ï', 'ô', 'û', 'ç', 'ë', 'ÿ', 'ñ'],
                    ['_', 'c', 'g', 'i', 'o', 's', 'u', 'C', 'G', 'I', 'O', 'S', 'U', 'ae', 'oe', 'ue', 'ss', 'Ae', 'Oe', 'Ue', 'e', 'e', 'e', 'a', 'a', 'i', 'i', 'o', 'u', 'c', 'e', 'y', 'n'],
                    $filename
                );
                $newFilename = $filename . '_' . $uniqueId . '.' . $extension;
                $path = $file->storeAs('uploads', $newFilename, 'public');
                $uploadedFiles[] = [
                    'name' => $newFilename,
                    'url' => asset('storage/' . $path),
                ];
            }
        }

        return response()->json($uploadedFiles);
    }
}
