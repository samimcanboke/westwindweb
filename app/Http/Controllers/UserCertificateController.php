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
        $fileIds = $request->input('files');
        $files = UserCertificate::whereIn('id', $fileIds)->pluck('file')->toArray();
        //$files = UserCertificate::whereIn('id', $fileIds)->get();
        $name = $request->input('name');

        $name = str_replace(
            ['ç', 'ğ', 'ı', 'ö', 'ş', 'ü', 'Ç', 'Ğ', 'İ', 'Ö', 'Ş', 'Ü', 'ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'],
            ['c', 'g', 'i', 'o', 's', 'u', 'C', 'G', 'I', 'O', 'S', 'U', 'ae', 'oe', 'ue', 'ss', 'Ae', 'Oe', 'Ue'],
            $name
        );

        $newFiles = [];

        foreach($files as $file){
        $filePath = storage_path('app/public/uploads/' . basename($file));
        if (!file_exists($filePath)) {
            $fileContent = file_get_contents($file);
            file_put_contents($filePath, $fileContent);
        }
        $newFiles[] = $filePath;
        }


        $name = str_replace(' ', '_', $name);

        $nameParts = explode('_', $name);
        if (count($nameParts) > 1) {
            $lastName = array_pop($nameParts);
            array_unshift($nameParts, $lastName);
            $name = implode('_', $nameParts);
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

            $attachment = $zipFileName;
        }
        $message = str_replace("\n", "<br>", $message);
        $message .= "<br><br>Sadettin Gökcen<br><br>Westwind-Eisenbahnservice<br>GmbH<br>Boelerstr. 153<br>58097 Hagen<br>Tel: 0176 1513 5952<br>info@westwind-eisenbahnservice.de<br>www.westwind-eisenbahnservice.de<br>Handelsregister:<br>Hagen - HRB 12738<br><br>Steuer-Nr.: 321/5766/1173<br>USt-ID-Nr.: DE361496739";

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
