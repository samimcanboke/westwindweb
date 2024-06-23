<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DraftJobsController;
use App\Http\Controllers\FinalizedJobsController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\JobPlansController;
use App\Http\Middleware\IsAdmin;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PdfController;
use App\Mail\MyTestEmail;
use Illuminate\Support\Facades\Mail;
use App\Mail\WelcomeMail;

use App\Events\UserRegistered;



use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});


Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->withoutMiddleware([IsAdmin::class])->name('dashboard');

Route::get('/users/index', function () {
    return Inertia::render('Admin/Users/Index');
})->middleware(['auth', 'verified', IsAdmin::class])->name('users.index');

Route::get('/users/edit/{user_id}', function ($user_id) {
    return Inertia::render('Admin/Users/Edit', ['user_id' => $user_id]);
})->middleware(['auth', 'verified', IsAdmin::class])->name('users.edit');

Route::get('/clients/index', function () {
    return Inertia::render('Admin/Clients/Index');
})->middleware(['auth', 'verified', IsAdmin::class])->name('clients-index');

Route::get('/users/create', function () {
    return Inertia::render('Admin/Users/Create');
})->middleware(['auth', 'verified', IsAdmin::class])->name('users.create');


Route::get('/clients/create', function () {
    return Inertia::render('Admin/Clients/Create');
})->middleware(['auth', 'verified', IsAdmin::class])->name('clients.create');

Route::get('/confirmed-jobs', function () {
    return Inertia::render('Admin/Jobs/Confirmed');
})->middleware(['auth', 'verified', IsAdmin::class])->name('confirmed-jobs');

Route::get('/wait-confirmation-jobs', function () {
    return Inertia::render('Admin/Jobs/WaitingConfirmed');
})->middleware(['auth', 'verified', IsAdmin::class])->name('wait-confirmed-jobs');

Route::get('/admin/planner', function () {
    return Inertia::render('Admin/Jobs/Planner');
})->middleware(['auth', 'verified', IsAdmin::class])->name('admin-planner');

Route::get('/clients/new-job', function () {
    return Inertia::render('Admin/Jobs/Create');
})->middleware(['auth', 'verified', IsAdmin::class])->name('clients.new-job');


Route::get('/new-jobs', function () {
    return Inertia::render('NewJobs');
})->middleware(['auth', 'verified'])->withoutMiddleware([IsAdmin::class])->name('new-jobs');

Route::get('/draft-jobs', function () {
    return Inertia::render('DraftJobs');
})->middleware(['auth', 'verified'])->withoutMiddleware([IsAdmin::class])->name('draft-jobs');

Route::get('/finalized-jobs', function () {
    return Inertia::render('FinalizedJobs');
})->middleware(['auth', 'verified'])->withoutMiddleware([IsAdmin::class])->name('finalized-jobs');

Route::get('/planner', function () {
    return Inertia::render('Planner');
})->middleware(['auth', 'verified'])->withoutMiddleware([IsAdmin::class])->name('planner');

Route::get('/sick-leaves', function () {
    return Inertia::render('SickLeaves');
})->middleware(['auth', 'verified'])->withoutMiddleware([IsAdmin::class])->name('sick-leaves');

Route::get('/annual-leaves', function () {
    return Inertia::render('AnnualLeaves');
})->middleware(['auth', 'verified'])->withoutMiddleware([IsAdmin::class])->name('annual-leaves');

Route::get('/data-draft-jobs', [DraftJobsController::class, 'index'])->middleware(['auth', 'verified'])->withoutMiddleware([IsAdmin::class])->name('data-draft-jobs');
Route::post('/save-draft-jobs', [DraftJobsController::class, 'store'])->middleware(['auth', 'verified'])->withoutMiddleware([IsAdmin::class])->name('save-draft-jobs');
Route::post('/delete-draft-jobs', [DraftJobsController::class, 'destroy'])->middleware(['auth', 'verified'])->withoutMiddleware([IsAdmin::class])->name('delete-draft-jobs');
Route::post('/send-submit-draft-jobs', [DraftJobsController::class, 'send_submit'])->middleware(['auth', 'verified'])->withoutMiddleware([IsAdmin::class])->name('send-submit-draft-jobs');
Route::post('/update-draft-jobs', [DraftJobsController::class, 'update'])->middleware(['auth', 'verified'])->withoutMiddleware([IsAdmin::class])->name('update-draft-jobs');

Route::get('/data-unconfirmed-jobs', [FinalizedJobsController::class, 'unconfirmed_jobs'])->middleware(['auth', 'verified'])->withoutMiddleware([IsAdmin::class])->name('data-unconfirmed-jobs');
Route::get('/data-confirmed-jobs', [FinalizedJobsController::class, 'confirmed_jobs'])->middleware(['auth', 'verified'])->withoutMiddleware([IsAdmin::class])->name('data-confirmed-jobs');
Route::post('/jobs-editing', [FinalizedJobsController::class, 'edit'])->middleware(['auth', 'verified',IsAdmin::class])->name('jobs-editing');
Route::post('/jobs-confirmation', [FinalizedJobsController::class, 'confirm_jobs'])->middleware(['auth', 'verified',IsAdmin::class])->name('jobs-confirmation');

Route::post('/admin/show-user/{user_id}', [RegisteredUserController::class, 'show_user'])->middleware(['auth', 'verified',IsAdmin::class])->name('user.show');


Route::get('/finalized-filter', [FinalizedJobsController::class, 'get_filters'])->middleware(['auth', 'verified'])->withoutMiddleware([IsAdmin::class])->name('finalized-filter');
Route::get('/admin/finalized-jobs', [FinalizedJobsController::class, 'index']);
Route::post('/admin/register_inside', [RegisteredUserController::class, 'store_inside'])->middleware(['auth', 'verified',IsAdmin::class])->name('register.inside');
Route::post('/admin/edit_inside', [RegisteredUserController::class, 'edit_inside'])->middleware(['auth', 'verified',IsAdmin::class])->name('edit.inside');


Route::get('/planner/jobs', [JobPlansController::class, 'index'])->middleware(['auth', 'verified',IsAdmin::class])->name('planner-jobs');
Route::get('/planner/jobs/without-user', [JobPlansController::class, 'index_without_user'])->middleware(['auth', 'verified',IsAdmin::class])->name('planner-jobs-without-user');
Route::get('/planner/jobs/show/{id}', [JobPlansController::class, 'show'])->middleware(['auth', 'verified',IsAdmin::class])->name('planner-jobs-show');
Route::post('/planner/jobs', [JobPlansController::class, 'store'])->middleware(['auth', 'verified',IsAdmin::class])->name('planner-jobs-store');
Route::put('/planner/jobs/update/{job}', [JobPlansController::class, 'update'])->middleware(['auth', 'verified',IsAdmin::class])->name('planner-jobs-update');
Route::put('/planner/jobs/{id}', [JobPlansController::class, 'leave_job'])->middleware(['auth', 'verified',IsAdmin::class])->name('planner-jobs-leave');
Route::delete('/planner/jobs', [JobPlansController::class, 'destroy'])->middleware(['auth', 'verified',IsAdmin::class])->name('planner-jobs-destroy');
Route::get('/planner/jobs/get-user-jobs', [JobPlansController::class, 'get_user_job_plans'])->middleware(['auth', 'verified'])->name('get-user-job-plans');
Route::get('/planner/jobs/get-users-jobs', [JobPlansController::class, 'get_users_jobs'])->middleware(['auth', 'verified'])->name('get-users-jobs');

Route::get('/planner/jobs/edit/{id}', function ($id) {
    return Inertia::render('Admin/Jobs/Edit', ['id' => $id]);
})->middleware(['auth', 'verified'])->name('planner-jobs-edit');


//Route::get('/planner/jobs/get-user-jobs', [JobPlansController::class, 'get_user_job_plans'])->middleware(['auth', 'verified'])->name('get-user-job-plans');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->withoutMiddleware([IsAdmin::class])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->withoutMiddleware([IsAdmin::class])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->withoutMiddleware([IsAdmin::class])->name('profile.destroy');
    Route::get('/clients', [ClientController::class, 'index'])->withoutMiddleware([IsAdmin::class])->name('clients.index');
    Route::post('/finalized-jobs/export', [FinalizedJobsController::class, 'get_finalized'])->withoutMiddleware([IsAdmin::class])->name('get-finalized');
    Route::get('/download-pdf/{filename}', [PdfController::class, 'downloadPdf'])->withoutMiddleware([IsAdmin::class])->name('download.pdf');
});


Route::get('/testroute', function() {
    $name = "Funny Coder";
    Mail::to('samimcanboke@hotmail.com')->send(new MyTestEmail($name));
});

Route::get('/test-email', function () {
    $user = \App\Models\User::first(); // Örneğin ilk kullanıcıya mail gönderelim
    $asd = Mail::to($user->email)->send(new WelcomeMail($user));
    dd($asd);
    return 'Mail sent!';
})->withoutMiddleware(['auth', 'verified',IsAdmin::class]);

Route::get('/trigger-event', function () {
    $user = \App\Models\User::first(); // Örneğin ilk kullanıcı
    $a = event(new UserRegistered($user));
    dd($a);
    return 'Event triggered!';
})->withoutMiddleware(['auth', 'verified',IsAdmin::class]);



require __DIR__.'/auth.php';
