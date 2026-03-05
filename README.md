index.blade 
<x-admin::layouts>

<x-slot:title>
Blog Management
</x-slot>

<div class="flex justify-between items-center mb-4">

<h1 class="text-xl font-bold">
Blogs
</h1>

<x-admin::button
    type="button"
    class="primary-button"
    @click="$refs.createBlog.open()"
>
Create Blog
</x-admin::button>

</div>

<datagrid src="{{ route('admin.blog.index') }}"></datagrid>

@include('blog::admin.create')
@include('blog::admin.edit')

</x-admin::layouts>

/////// /                                Resources/views/admin/create.blade.php

<x-admin::modal ref="createBlog">

<x-slot:header>

<h2 class="text-lg font-bold">
Create Blog
</h2>

</x-slot>

<x-slot:content>

<form method="POST" action="{{ route('admin.blog.store') }}">

@csrf

<div class="grid gap-4">

<x-admin::form.control-group>

<x-admin::form.control-group.label class="required">
Title
</x-admin::form.control-group.label>

<x-admin::form.control-group.control
type="text"
name="title"
rules="required"
placeholder="Blog Title"
/>

</x-admin::form.control-group>

<x-admin::form.control-group>

<x-admin::form.control-group.label class="required">
Slug
</x-admin::form.control-group.label>

<x-admin::form.control-group.control
type="text"
name="slug"
rules="required"
placeholder="blog-slug"
/>

</x-admin::form.control-group>

<x-admin::form.control-group>

<x-admin::form.control-group.label>
Content
</x-admin::form.control-group.label>

<x-admin::form.control-group.control
as="textarea"
name="content"
rules="required"
placeholder="Blog content"
/>

</x-admin::form.control-group>

<x-admin::form.control-group>

<x-admin::form.control-group.label>
Status
</x-admin::form.control-group.label>

<x-admin::form.control-group.control
type="select"
name="is_active"
>

<option value="1">Active</option>
<option value="0">Inactive</option>

</x-admin::form.control-group.control>

</x-admin::form.control-group>

</div>

<div class="mt-5 flex justify-end">

<button class="primary-button">

Save Blog

</button>

</div>

</form>

</x-slot>

</x-admin::modal>

///////////////////////////////📄 Resources/views/admin/edit.blade.php

<x-admin::modal ref="editBlog">

<x-slot:header>

<h2 class="text-lg font-bold">
Edit Blog
</h2>

</x-slot>

<x-slot:content>

<form method="POST" id="editBlogForm">

@csrf
@method('PUT')

<div class="grid gap-4">

<x-admin::form.control-group>

<x-admin::form.control-group.label>
Title
</x-admin::form.control-group.label>

<x-admin::form.control-group.control
type="text"
name="title"
id="edit_title"
/>

</x-admin::form.control-group>

<x-admin::form.control-group>

<x-admin::form.control-group.label>
Slug
</x-admin::form.control-group.label>

<x-admin::form.control-group.control
type="text"
name="slug"
id="edit_slug"
/>

</x-admin::form.control-group>

<x-admin::form.control-group>

<x-admin::form.control-group.label>
Content
</x-admin::form.control-group.label>

<x-admin::form.control-group.control
as="textarea"
name="content"
id="edit_content"
/>

</x-admin::form.control-group>

<x-admin::form.control-group>

<x-admin::form.control-group.label>
Status
</x-admin::form.control-group.label>

<x-admin::form.control-group.control
type="select"
name="is_active"
id="edit_status"
>

<option value="1">Active</option>
<option value="0">Inactive</option>

</x-admin::form.control-group.control>

</x-admin::form.control-group>

</div>

<div class="mt-5 flex justify-end">

<button class="primary-button">

Update Blog

</button>

</div>

</form>

</x-slot>

</x-admin::modal>


//////////////////   a dd in index page   
<script>

function editBlog(blog){

document.getElementById("edit_title").value = blog.title;
document.getElementById("edit_slug").value = blog.slug;
document.getElementById("edit_content").value = blog.content;
document.getElementById("edit_status").value = blog.is_active;

document.getElementById("editBlogForm").action =
"/admin/blog/update/"+blog.id;

window.app.$refs.editBlog.open();

}

</script>



////                       migration  
Schema::create('blogs', function (Blueprint $table) {

    $table->id();
    $table->string('title');
    $table->string('slug')->unique();
    $table->text('content');
    $table->boolean('is_active')->default(1);
    $table->timestamps();

});

//////////////////////////bklog moderl 
<?php

namespace Webkul\Blog\Models;

use Illuminate\Database\Eloquent\Model;

class Blog extends Model
{
    protected $table = 'blogs';

    protected $fillable = [
        'title',
        'slug',
        'content',
        'is_active'
    ];
}


////////////////// repository
<?php

namespace Webkul\Blog\Repositories;

use Webkul\Core\Eloquent\Repository;

class BlogRepository extends Repository
{
    public function model()
    {
        return "Webkul\\Blog\\Models\\Blog";
    }
}



////////////////////////////validation ruless



<?php

namespace Webkul\Blog\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BlogRequest extends FormRequest
{

    public function rules()
    {
        return [
            'title' => 'required',
            'slug' => 'required',
            'content' => 'required'
        ];
    }
}




////////////////////////routes


<?php

use Illuminate\Support\Facades\Route;
use Webkul\Blog\Http\Controllers\Admin\BlogController;

Route::group([
'middleware' => ['web','admin'],
'prefix' => 'admin/blog'
], function () {

Route::get('/', [BlogController::class,'index'])
->name('admin.blog.index');

Route::post('/store',[BlogController::class,'store'])
->name('admin.blog.store');

Route::put('/update/{id}',[BlogController::class,'update'])
->name('admin.blog.update');

Route::delete('/delete/{id}',[BlogController::class,'destroy'])
->name('admin.blog.delete');

});






controller

<?php

namespace Webkul\Blog\Http\Controllers\Admin;

use Illuminate\Routing\Controller;
use Webkul\Blog\Repositories\BlogRepository;
use Webkul\Blog\DataGrids\BlogDataGrid;
use Webkul\Blog\Http\Requests\BlogRequest;

class BlogController extends Controller
{

    protected $blogRepository;

    public function __construct(BlogRepository $blogRepository)
    {
        $this->blogRepository = $blogRepository;
    }

    public function index()
    {

        if(request()->ajax()){
            return app(BlogDataGrid::class)->toJson();
        }

        return view('blog::admin.index');

    }

    //public function create()
    //{
      //  return view('blog::admin.create');
    //}

    public function store(BlogRequest $request)
    {

        $this->blogRepository->create($request->all());

        session()->flash('success','Blog created successfully');

        return redirect()->route('admin.blog.index');

    }

    //public function edit($id)
    //{

        $blog = $this->blogRepository->findOrFail($id);

        return view('blog::admin.edit',compact('blog'));

    // }

    public function update(BlogRequest $request,$id)
    {

        $this->blogRepository->update($request->all(),$id);

        session()->flash('success','Blog updated successfully');

        return redirect()->route('admin.blog.index');

    }

    public function destroy($id)
    {

        $this->blogRepository->delete($id);

        return response()->json([
            'message' => 'Blog deleted successfully'
        ]);

    }

}

/////////////////  DataGrid.php 


<?php

namespace Webkul\Blog\DataGrids;

use Illuminate\Support\Facades\DB;
use Webkul\DataGrid\DataGrid;

class BlogDataGrid extends DataGrid
{

    protected $index = 'id';

    public function prepareQueryBuilder()
    {

        $queryBuilder = DB::table('blogs')
            ->select(
                'id',
                'title',
                'slug',
                'is_active'
            );

        $this->addFilter('id', 'blogs.id');
        $this->addFilter('title', 'blogs.title');
        $this->addFilter('slug', 'blogs.slug');

        $this->setQueryBuilder($queryBuilder);

    }

    public function prepareColumns()
    {

        $this->addColumn([
            'index' => 'id',
            'label' => 'ID',
            'type' => 'number',
            'searchable' => true,
            'sortable' => true,
            'filterable' => true
        ]);

        $this->addColumn([
            'index' => 'title',
            'label' => 'Title',
            'type' => 'string',
            'searchable' => true,
            'sortable' => true,
            'filterable' => true
        ]);

        $this->addColumn([
            'index' => 'slug',
            'label' => 'Slug',
            'type' => 'string',
            'searchable' => true,
            'sortable' => true
        ]);

        $this->addColumn([
            'index' => 'is_active',
            'label' => 'Status',
            'type' => 'boolean',
            'sortable' => true,
            'closure' => function ($row) {

                if ($row->is_active) {
                    return '<span class="badge badge-success">Active</span>';
                }

                return '<span class="badge badge-danger">Inactive</span>';
            }
        ]);

    }

    public function prepareActions()
    {
/////////////check by this below which is 

        $this->addAction([
            'title' => 'Edit',
            'method' => 'GET',
            'route' => 'admin.blog.edit',
            'icon' => 'icon-edit'
        ]);


///// this one   
$this->addAction([
'title' => 'Edit',
'method' => 'GET',
'icon' => 'icon-edit',
'url' => function ($row) {
    return "javascript:editBlog(".json_encode($row).")";
}
]);
        $this->addAction([
            'title' => 'Delete',
            'method' => 'DELETE',
            'route' => 'admin.blog.delete',
            'icon' => 'icon-delete'
        ]);

    }

}



///////////////////////////////admin menu

<?php

return [

[
'key' => 'blog',
'name' => 'Blog',
'route' => 'admin.blog.index',
'sort' => 3,
'icon' => 'icon-cms'
]

];

////////////////////////////// Acl permission


<?php

return [

[
'key'=>'blog',
'name'=>'Blog',
'route'=>'admin.blog.index',
'sort'=>1
],

[
'key'=>'blog.create',
'name'=>'Create',
'route'=>'admin.blog.create',
'sort'=>1
],

[
'key'=>'blog.edit',
'name'=>'Edit',
'route'=>'admin.blog.edit',
'sort'=>2
],

[
'key'=>'blog.delete',
'name'=>'Delete',
'route'=>'admin.blog.delete',
'sort'=>3
]

];


packages
 └── Webkul
      └── Blog
           └── src
                ├── Config
                │    ├── acl.php
                │    └── menu.php
                ├── Providers
                │    └── BlogServiceProvider.php
                ├── Http
                │    ├── Controllers/Admin
                │    │    └── BlogController.php
                │    ├── Requests
                │    │    └── BlogRequest.php
                │    └── routes.php
                ├── Models
                │    └── Blog.php
                ├── Repositories
                │    └── BlogRepository.php
                ├── DataGrids
                │    └── BlogDataGrid.php
                ├── Database/Migrations
                └── Resources/views/admin
                     ├── index.blade.php
                     ├── create.blade.php
                     └── edit.blade.php




<span class="badge badge-success">   insted use below   
return '<span class="text-green-600 font-semibold">Active</span>'; 




correct js 
function editBlog(blog){

document.getElementById("edit_title").value = blog.title;
document.getElementById("edit_slug").value = blog.slug;
document.getElementById("edit_content").value = blog.content;
document.getElementById("edit_status").value = blog.is_active;

document.getElementById("editBlogForm").action =
"/admin/blog/update/"+blog.id;

app.$refs.editBlog.open();

}



//// service provider 
class BlogServiceProvider extends ServiceProvider
{

public function register()
{
    $this->mergeConfigFrom(
        dirname(__DIR__) . '/Config/menu.php',
        'menu.admin'
    );
}

public function boot()
{
    $this->loadRoutesFrom(__DIR__.'/../Http/routes.php');

    $this->loadViewsFrom(__DIR__.'/../Resources/views','blog');

    $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');
}

}
