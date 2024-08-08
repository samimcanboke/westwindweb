<?php

namespace App\Http\Controllers;

use App\Models\BahnCard;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;


class BahnCardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $bahnCards = BahnCard::all();
        return response()->json($bahnCards);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
       //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
       $request->validate([
        'number' => ['required', 'string', function ($attribute, $value, $fail) {
            if (strlen(str_replace(' ', '', $value)) !== 16) {
                $fail('Bahn Karte Nummer muss genau 16 Ziffern lang sein.');
            }
        }],
        'valid_from' => 'required|date',
        'valid_to' => 'required|date',
        'class' => 'required|string|in:1,2'
       ]);

       $bahnCard = BahnCard::create($request->all());

       return response()->json(["success" => true, "data" => $bahnCard]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, BahnCard $bahnCard)
    {
        $id = $request->route('id');
        $bahnCard = BahnCard::find($id);
        return response()->json(["success" => true, "data" => $bahnCard]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(BahnCard $bahnCard)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, BahnCard $bahnCard)
    {
        $id = $request->route('id');
        $bahnCard = BahnCard::find($id);
        $bahnCard->user_id = $request->driver ?? $bahnCard->user_id;
        $bahnCard->number = $request->number ?? $bahnCard->number;
        $bahnCard->valid_from = $request->valid_from ?? $bahnCard->valid_from;
        $bahnCard->valid_to = $request->valid_to ?? $bahnCard->valid_to;
        $bahnCard->class = $request->class ?? $bahnCard->class;
        $bahnCard->save();
        return response()->json(["success" => true, "data" => $bahnCard]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, BahnCard $bahnCard)
    {

        $bahnCard->where('id', $request->id)->delete();
        return response()->json(["success" => true, "data" => $bahnCard]);
    }
}
