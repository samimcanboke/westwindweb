<?php

namespace App\Http\Controllers;

use App\Models\UserCertificate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class UserCertificateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($user_id)
    {
        $userCertificates = UserCertificate::where('user_id', $user_id)->get();
        return response()->json($userCertificates);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    public function send_email(Request $request)
    {
        $request->validate([
            'recipient' => 'required|email',
            'subject' => 'required',
            'message' => 'required',
            'files' => 'required',
        ]);

        $recipient = $request->input('recipient');
        $subject = $request->input('subject');
        $message = $request->input('message');
        $files = $request->input('files');
        $name = $request->input('name');

        $name = str_replace(
            ['ç', 'ğ', 'ı', 'ö', 'ş', 'ü', 'Ç', 'Ğ', 'İ', 'Ö', 'Ş', 'Ü', 'ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'],
            ['c', 'g', 'i', 'o', 's', 'u', 'C', 'G', 'I', 'O', 'S', 'U', 'ae', 'oe', 'ue', 'ss', 'Ae', 'Oe', 'Ue'],
            $name
        );

        $name = str_replace(' ', '_', $name);

        $nameParts = explode('_', $name);
        if (count($nameParts) > 1) {
            $lastName = array_pop($nameParts);
            array_unshift($nameParts, $lastName);
            $name = implode('_', $nameParts);
        }

        $totalSize = 0;
        foreach ($files as $file) {
            $filePath = storage_path('app/public/uploads/' . basename($file));
            if (file_exists($filePath)) {
                $totalSize += filesize($filePath);
            } else {
                return response()->json(['error' => 'Dosya bulunamadı: ' . $filePath], 404);
            }
        }

        if (count($files) == 1) {
            // Tek dosya varsa direk ekle
            $attachment = storage_path('app/public/uploads/' . basename($files[0]));
        } else {
            $zip = new \ZipArchive();
            $zipFileName = storage_path('app/public/uploads/00_Tfz_' . $name . '_Zertifikate.zip');

            if ($zip->open($zipFileName, \ZipArchive::CREATE) === true) {
                foreach ($files as $file) {
                    $filePath = storage_path('app/public/uploads/' . basename($file));
                    $zip->addFile($filePath, basename($file));
                }
                $zip->close();
            }

            if ($totalSize > 15 * 1024 * 1024) {
                $zip1 = new \ZipArchive();
                $zipFileName1 = storage_path('app/public/uploads/00_Tfz_' . $name . '_Zertifikate_part1.zip');
                $zip2 = new \ZipArchive();
                $zipFileName2 = storage_path('app/public/uploads/00_Tfz_' . $name . '_Zertifikate_part2.zip');

                $zip1->open($zipFileName1, \ZipArchive::CREATE);
                $zip2->open($zipFileName2, \ZipArchive::CREATE);

                $currentSize = 0;
                foreach ($files as $file) {
                    $filePath = storage_path('app/public/uploads/' . basename($file));
                    $fileSize = filesize($filePath);
                    if ($currentSize + $fileSize <= 15 * 1024 * 1024) {
                        $zip1->addFile($filePath, basename($file));
                        $currentSize += $fileSize;
                    } else {
                        $zip2->addFile($filePath, basename($file));
                    }
                }

                $zip1->close();
                $zip2->close();

            } else {
                $attachment = $zipFileName;
            }
        }


        $message .= "\n\nSadettin Gökcen\n\nWestwind-Eisenbahnservice\nGmbH\nBoelerstr. 153\n58097 Hagen\nTel: 0176 1513 5952\ninfo@westwind-eisenbahnservice.de\nwww.westwind-eisenbahnservice.de\nHandelsregister:\nHagen - HRB 12738\n\nSteuer-Nr.: 321/5766/1173\nUSt-ID-Nr.: DE361496739";

        $data = [
            'recipient' => $recipient,
            'subject' => $subject,
            'message' => $message,
        ];

        Mail::send([], [], function ($mail) use ($data, $attachment) {
            $mail->to($data['recipient'])
                ->subject($data['subject'])
                ->html($data['message'])
                ->attach($attachment);
        });

        return response()->json(['success' => 'Mail başarıyla gönderildi.']);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {

        $request->validate([
            'certificate_id' => 'required',
            'user_id' => 'required',
            'file' => 'required',
        ]);

        $userCertificate = UserCertificate::create($request->all());
        return response()->json(["success" => true, "message" => "Sertifika başarıyla eklendi."], 201);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $userCertificate = UserCertificate::where('id', $id)->first();
        $userCertificate->delete();
        return response()->json(["success" => true, "message" => "Sertifika başarıyla kaldırıldı."], 200);
    }
}
