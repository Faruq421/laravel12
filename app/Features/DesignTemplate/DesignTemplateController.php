<?php

namespace App\Features\DesignTemplate;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class DesignTemplateController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $originalName = pathinfo($request->file('file')->getClientOriginalName(), PATHINFO_FILENAME);
        $path = $request->file('file')->store('design-templates/files', 'public');

        $template = DesignTemplate::create([
            'name' => $originalName,
            'thumbnail_path' => $path,
            'file_path' => $path,
        ]);

        return response()->json($template);
    }
}
