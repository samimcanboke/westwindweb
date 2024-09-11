<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Events\UserRegistered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    public function show()
    {
        $users = User::where('is_active', 1)->withoutLeaveWorkingDate()->get();
        return response()->json($users);
    }

    public function show_all()
    {
        $users = User::all();
        return response()->json($users);
    }

    public function show_leave_jobs()
    {
        $users = User::where('is_active', 1)->get();
        return response()->json($users);
    }

    public function show_user($user_id)
    {
        $user = User::find($user_id);
        return response()->json($user);
    }
    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        event(new UserRegistered($user));
        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }

    public function store_inside(Request $request): JsonResponse
    {
        $data = $request->all();
        $data['start_working_date'] = Carbon::createFromDate($request->start_working_date)->format('Y-m-d');
        $request->merge($data);
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'unique:users,phone'],
            'driver_id' => ['required', 'string', 'max:255', 'unique:users,driver_id'],
            'birth_date' => ['required', 'date'],
            'working_hours' => ['required', 'numeric'],
            'sick_holiday' => ['required', 'numeric'],
            'start_working_date' => ['required', 'date'],
            'annual_leave_rights' => ['required', 'numeric'],
            'salary' => ['required', 'numeric'],
            'password' => ['required', Rules\Password::defaults()],
        ]);


        $user = User::create([
            'driver_id' => $request->driver_id,
            'birth_date' => $request->birth_date,
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'working_hours' => $request->working_hours,
            'annual_leave_rights' => $request->annual_leave_rights,
            'start_working_date' => $request->start_working_date,
            'salary' => $request->salary,
            'sick_holiday' => $request->sick_holiday,
            'password' => Hash::make($request->password),
            'is_admin' => $request->is_admin,
            'accountant' => $request->accountant,
            'private_phone' => $request->private_phone,
            'address' => $request->address,
            'nationality' => $request->nationality,
            'bank_name' => $request->bank_name,
            'bank_account_number' => $request->bank_account_number,
            'bank_iban' => $request->bank_iban,
            'bank_bic' => $request->bank_bic,
            'bank_account_holder' => $request->bank_account_holder,
            'insurance_number' => $request->insurance_number,
            'social_security_number' => $request->social_security_number,
            'social_security_name' => $request->social_security_name,
            'kinder' => $request->kinder,
            'is_retired' => $request->is_retired,
            'tax_class' => $request->tax_class,
            'identity_number' => $request->identity_number,
            'urgency_contact_name' => $request->urgency_contact_name,
            'urgency_contact_phone' => $request->urgency_contact_phone,
            'street' => $request->street,
            'city' => $request->city,
            'zip_code' => $request->zip_code,
            'apartment' => $request->apartment,
            'tax_id' => $request->tax_id,

        ]);
        event(new UserRegistered($user));
        return response()->json(['success'=>true, 'message' => 'User created successfully']);
    }

    public function edit_inside(Request $request)
    {
        $user = User::find($request->id);
        if($request->password != null){
            $request->merge(['password' => Hash::make($request->password)]);
        } else{
            $request->merge(['password' => $user->password]);
        }
        $start = Carbon::createFromDate($request->start_working_date);
        $data['start_working_date'] = $start->format('Y-m-d');
        $request->merge($data);
        $user->update($request->all());
        return response()->json(['success'=>true, 'message' => 'User updated successfully']);
    }

    public function leave_jobs(Request $request)
    {
        $user = User::where('id', $request->id)->first();
        $user->leave_working_date = Carbon::now()->format('Y-m-d');
        $user->is_active = 0;
        $user->save();
        return response()->json(['success'=>true, 'message' => 'User left the job successfully']);
    }
}
