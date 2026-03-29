# Bagisto Beginner Notes

This file summarizes the discussion from this session in a simple, beginner-friendly way.

The project structure here is:

- Outer workspace: `e:\bagisto`
- Real Bagisto app: `e:\bagisto\bagisto`

So this `README.md` is intentionally placed outside the inner `bagisto` folder.

## 1. What Bagisto Is

Bagisto is a Laravel application, but most of its real business features are split into packages inside:

- `bagisto/packages/Webkul/*`

Examples:

- `Admin`
- `Core`
- `Shop`
- `Theme`
- `Product`
- `Sales`
- `Customer`
- `Checkout`

So Bagisto is not one large codebase with everything in `app/`.  
It is Laravel plus many feature packages.

## 2. How Bagisto Starts Loading

The first important file is:

- `bagisto/bootstrap/providers.php`

Laravel loads service providers from this file.  
This is where Bagisto registers packages like:

- `CoreServiceProvider`
- `AdminServiceProvider`
- `ShopServiceProvider`
- `ProductServiceProvider`
- `SalesServiceProvider`
- and many more

This means Bagisto boots package by package.

## 3. Concord Module Loading

Another important file is:

- `bagisto/config/concord.php`

Bagisto uses `konekt/concord` for module/model registration.

This file loads each package's `ModuleServiceProvider`.

So Bagisto has two important loading layers:

1. Laravel service providers
2. Concord module providers

## 4. What Core Does

The main shared package is:

- `bagisto/packages/Webkul/Core`

Important file:

- `bagisto/packages/Webkul/Core/src/Providers/CoreServiceProvider.php`

This package provides common shared functionality such as:

- migrations
- translations
- views
- event registration
- console commands
- helper functions
- global shared services

Core helper file:

- `bagisto/packages/Webkul/Core/src/Http/helpers.php`

This defines helpers like:

- `core()`
- `menu()`
- `acl()`
- `system_config()`

The main `core()` object comes from:

- `bagisto/packages/Webkul/Core/src/Core.php`

This class is very important. It manages:

- current channel
- default channel
- current locale
- current currency
- shared config access
- formatting prices and dates

When you see:

```php
core()->getCurrentChannel()
core()->getConfigData(...)
core()->getCurrentCurrency()
```

that means Bagisto is using the shared Core layer.

## 5. How Admin Connects With Core

The admin package is:

- `bagisto/packages/Webkul/Admin`

Important file:

- `bagisto/packages/Webkul/Admin/src/Providers/AdminServiceProvider.php`

This provider:

- registers admin routes
- loads admin translations
- loads admin views
- registers admin Blade components
- merges admin menu config
- merges admin ACL config
- merges admin system config

This is the key connection between Admin and Core.

Admin contributes into shared systems:

- menu
- ACL
- system configuration

So Admin is the management UI layer, while Core is the shared platform layer.

## 6. Where Admin Routes Come From

Admin routes are loaded from:

- `bagisto/packages/Webkul/Admin/src/Routes/web.php`

That file includes many route files such as:

- `sales-routes.php`
- `catalog-routes.php`
- `customers-routes.php`
- `settings-routes.php`

These routes are grouped under:

- admin URL prefix from `config('app.admin_url')`
- admin middleware

So the admin panel is basically a large set of route files under one protected route group.

## 7. Where the `admin` Middleware Comes From

The `admin` middleware is not defined by the Admin package.

It is registered by the User package:

- `bagisto/packages/Webkul/User/src/Providers/UserServiceProvider.php`

This provider maps:

- `admin` middleware -> `Webkul\User\Http\Middleware\Bouncer`

Middleware file:

- `bagisto/packages/Webkul/User/src/Http/Middleware/Bouncer.php`

This middleware checks:

- is admin logged in?
- is admin active?
- does the admin role have permissions?
- is two-factor authentication required?
- is the current route authorized?

So the connection is:

- `Admin` defines admin routes
- `User` protects those routes
- `Core` provides helpers like ACL/menu/config used across admin

## 8. How Themes Are Loaded

Theme package:

- `bagisto/packages/Webkul/Theme`

Important file:

- `bagisto/packages/Webkul/Theme/src/Providers/ThemeServiceProvider.php`

This provider does two important things:

- includes theme helper functions
- replaces Laravel's normal view finder with Bagisto's `ThemeViewFinder`

This means Bagisto changes how Laravel looks for Blade views.

Theme helper file:

- `bagisto/packages/Webkul/Theme/src/Http/helpers.php`

This defines:

- `themes()`
- `bagisto_asset()`
- `view_render_event()`

Theme manager:

- `bagisto/packages/Webkul/Theme/src/Themes.php`

This class:

- loads configured themes
- checks whether the request is admin or shop
- activates the current theme
- changes Laravel view paths
- resolves themed assets

Theme config file:

- `bagisto/config/themes.php`

This file contains separate theme config for:

- `shop`
- `admin`

So Bagisto supports both storefront themes and admin themes.

## 9. How Shop Theme Gets Selected

Shop package:

- `bagisto/packages/Webkul/Shop`

Important file:

- `bagisto/packages/Webkul/Shop/src/Providers/ShopServiceProvider.php`

This package defines the `shop` middleware group:

- `Theme`
- `Locale`
- `Currency`

Theme middleware:

- `bagisto/packages/Webkul/Shop/src/Http/Middleware/Theme.php`

This middleware:

1. gets current channel from `core()`
2. checks channel theme
3. calls `themes()->set(...)`
4. updates view paths

So storefront theme loading happens automatically in middleware before the controller runs.

## 10. Full Request Flow in Simple Words

For an admin request:

1. Laravel boots
2. Bagisto service providers are loaded
3. Admin routes are registered
4. Request hits an admin URL
5. `admin` middleware runs
6. auth/permission checks happen
7. controller runs
8. repository/model logic runs
9. view renders admin page

For a shop request:

1. Laravel boots
2. Bagisto providers load
3. shop routes are registered
4. request enters `shop` middleware
5. theme/locale/currency are set
6. controller runs
7. themed view renders

## 11. Best Way to Read Any Bagisto Feature

When trying to understand a feature, follow this order:

1. Find the package
2. Open its service provider
3. Open its route file
4. Open its controller
5. Follow to repository
6. Follow to model
7. Check migration
8. Check related views/config/listeners/jobs

This is the easiest practical approach for a beginner.

## 12. Important Realization About Bagisto Packages

There is usually not one single package that contains everything for one feature.

Bagisto often splits a feature across multiple packages:

- business logic in one package
- admin UI in `Admin`
- storefront UI in `Shop`
- shared services in `Core`

This is why Bagisto can feel confusing at first.

## 13. Best Reference Feature: Product

The best example feature for understanding Bagisto is Product.

But the Product feature is split across packages:

- Domain/business logic: `bagisto/packages/Webkul/Product`
- Admin UI: `bagisto/packages/Webkul/Admin`

This is normal in Bagisto.

### 14. Product Feature Architecture

#### Product package responsibilities

Inside `bagisto/packages/Webkul/Product/src` you can find:

- `Config`
- `Contracts`
- `Database`
- `Helpers`
- `Jobs`
- `Listeners`
- `Models`
- `Providers`
- `Repositories`
- `Resources`
- `Type`

### Admin package responsibilities for Product

Inside `bagisto/packages/Webkul/Admin/src` you can find Product admin pieces such as:

- routes
- controllers
- datagrids
- admin views

So Product feature is a combination of:

- Product package for data + business logic
- Admin package for admin UI

## 15. Product Providers

Important files:

- `bagisto/packages/Webkul/Product/src/Providers/ProductServiceProvider.php`
- `bagisto/packages/Webkul/Product/src/Providers/ModuleServiceProvider.php`
- `bagisto/packages/Webkul/Product/src/Providers/EventServiceProvider.php`

`ProductServiceProvider`:

- includes helper functions
- merges product type config
- loads migrations
- loads translations
- registers observer
- registers event provider

`ModuleServiceProvider`:

- registers models with Concord

`EventServiceProvider`:

- maps events to listeners

## 16. Product Config

Important file:

- `bagisto/packages/Webkul/Product/src/Config/product_types.php`

This file maps product types to PHP classes:

- simple
- configurable
- bundle
- virtual
- grouped
- downloadable
- booking

This means Bagisto decides product behavior through config and type classes.

## 17. Product Contracts and Models

Important files:

- `bagisto/packages/Webkul/Product/src/Contracts/Product.php`
- `bagisto/packages/Webkul/Product/src/Models/Product.php`

The contract is used by repositories and Concord.

The model contains:

- table mappings
- relations
- dynamic attribute loading
- access to type instance

Examples of relations in the model:

- categories
- images
- variants
- attribute values
- price indices
- inventory indices

One of the most important methods is:

- `getTypeInstance()`

This reads config and returns the proper type class for the product.

## 18. Product Repository

Important file:

- `bagisto/packages/Webkul/Product/src/Repositories/ProductRepository.php`

This repository handles:

- create
- update
- copy
- search
- slug-based finding
- database search
- elastic search support

The controller usually talks to the repository instead of writing raw DB logic.

## 19. Product Type Classes

Important folder:

- `bagisto/packages/Webkul/Product/src/Type`

Main base class:

- `bagisto/packages/Webkul/Product/src/Type/AbstractType.php`

This acts like the real service layer for Product behavior.

It handles things like:

- create product
- update product
- save attribute values
- sync categories/channels
- upload images/videos
- save inventories
- prepare cart data
- price handling
- stock handling

So even though there is no `Services` folder here, the type classes play a service-like role.

## 20. Product Admin Routes

Important file:

- `bagisto/packages/Webkul/Admin/src/Routes/catalog-routes.php`

This file defines routes for products in admin:

- index
- create
- edit
- update
- delete
- copy
- search
- mass update
- mass delete

These routes point to Product admin controllers in the Admin package.

## 21. Product Admin Controller

Important file:

- `bagisto/packages/Webkul/Admin/src/Http/Controllers/Catalog/ProductController.php`

This controller:

- returns product index view
- handles AJAX datagrid response
- stores product
- updates product
- deletes product
- copies product
- searches products

The common Bagisto pattern here is:

1. validate request
2. dispatch event before action
3. call repository
4. dispatch event after action
5. return response

## 22. Product DataGrid

Important file:

- `bagisto/packages/Webkul/Admin/src/DataGrids/Catalog/ProductDataGrid.php`

This class defines:

- query
- columns
- filters
- sorting
- actions
- mass actions
- export behavior

Very important point:

Product listing in admin often reads from `product_flat` table instead of raw product attribute tables.

That is done for speed and easier querying.

So Bagisto often uses:

- raw normalized tables for saving/editing
- flat/index tables for fast listing/searching

## 23. Product Events and Listeners

Event registration:

- `bagisto/packages/Webkul/Product/src/Providers/EventServiceProvider.php`

Listener:

- `bagisto/packages/Webkul/Product/src/Listeners/Product.php`

When the admin controller creates or updates a product, it dispatches events such as:

- `catalog.product.create.after`
- `catalog.product.update.after`
- `catalog.product.delete.before`

The Product listener reacts to these events and updates related product data.

This includes:

- refreshing flat data
- collecting related product IDs
- dispatching indexing jobs

## 24. Product Jobs

Examples:

- `bagisto/packages/Webkul/Product/src/Jobs/UpdateCreateInventoryIndex.php`
- `bagisto/packages/Webkul/Product/src/Jobs/UpdateCreatePriceIndex.php`
- `bagisto/packages/Webkul/Product/src/Jobs/ElasticSearch/UpdateCreateIndex.php`

These jobs update:

- inventory index
- price index
- elasticsearch index

So Bagisto does not keep everything in one synchronous request.  
It uses jobs for heavy secondary work.

## 25. Product Observer

Important file:

- `bagisto/packages/Webkul/Product/src/Observers/ProductObserver.php`

This observer runs on model lifecycle events.

Example:

- when a product is deleted, media directories are cleaned from storage

So:

- listeners react to application/business events
- observers react to model lifecycle events

## 26. Product Helpers

Helper file:

- `bagisto/packages/Webkul/Product/src/Http/helpers.php`

This provides helper functions like:

- `product_image()`
- `product_video()`
- `product_toolbar()`

There are also utility helper classes like:

- `bagisto/packages/Webkul/Product/src/Helpers/Product.php`

## 27. Product Database and Resources

Database folder:

- `bagisto/packages/Webkul/Product/src/Database`

Contains:

- migrations
- factories

Resources folder:

- `bagisto/packages/Webkul/Product/src/Resources`

Contains:

- translations
- manifest

Admin product views are not here.  
They are mostly in the Admin package.

## 28. End-to-End Product Create Flow

This is the clearest full example:

1. Admin opens product page
2. Route from `Admin/Routes/catalog-routes.php` matches
3. `Admin` ProductController handles the request
4. Controller validates request
5. Controller fires `catalog.product.create.before`
6. Controller calls `ProductRepository`
7. Repository chooses correct product type class from config
8. Type class creates product and saves related data
9. Controller fires `catalog.product.create.after`
10. Product listener catches event
11. Listener refreshes flat/index/search related data
12. Jobs may run for inventory/price/search indexing
13. Product appears in admin datagrid and storefront correctly

## 29. Simple Mental Model for Bagisto

Use this model in your head:

- `Core` = shared platform logic
- `Admin` = admin panel UI
- `User` = admin auth and permissions
- `Theme` = view and asset theming
- `Shop` = storefront routes and middleware
- `Product`, `Sales`, `Customer`, etc. = business/domain features

And remember:

- one feature is often split across multiple packages

## 30. Recommended Way to Study Further

For any feature you want to learn next, use this sequence:

1. Route
2. Middleware
3. Controller
4. Repository
5. Model
6. Events/listeners
7. Jobs
8. Datagrid or view
9. Config

This is the best way to become comfortable in Bagisto as a beginner.

## 31. What Each Common Folder Means

This section explains the folders in a more practical way:

- what they usually contain
- why they are used
- how they connect with other parts

### `Config`

What it contains:

- package configuration arrays
- menu definitions
- ACL permissions
- system configuration fields
- feature settings

Examples:

- `menu.php`
- `acl.php`
- `system.php`
- `product_types.php`

Why it is used:

- to define package behavior without hardcoding everything inside classes
- to register admin menus
- to define permissions
- to define configuration options shown in admin settings
- to map feature types to classes

How it connects:

- providers usually call `mergeConfigFrom(...)`
- Core/Admin read merged configuration
- code later uses `config(...)` or `core()->getConfigData(...)`

Simple example:

- in Product, `product_types.php` tells Bagisto which class handles `simple`, `bundle`, `configurable`, etc.

### `Database`

What it contains:

- migrations
- factories
- sometimes seed-related files

Why it is used:

- migrations create or update database tables
- factories create test/sample model data

How it connects:

- service providers call `loadMigrationsFrom(...)`
- Laravel migration system executes those files
- models and repositories later use those tables

Simple example:

- Product migrations create tables like `products`, `product_attribute_values`, `product_images`, `product_price_indices`

### `DataGrids`

What it contains:

- admin listing logic
- query builder for table data
- column definitions
- filters
- sorting
- actions and mass actions

Why it is used:

- Bagisto admin uses datagrids for listing pages like products, orders, customers
- it keeps table logic separate from controllers

How it connects:

- controller calls `datagrid(...)->process()`
- datagrid builds query and response
- admin view renders the grid

Simple example:

- `ProductDataGrid` decides what columns appear in product listing, how search works, and what edit/delete actions are available

### `Http`

What it contains:

- controllers
- requests
- middleware
- API resources
- helper files

Why it is used:

- this is the web/request layer
- controllers handle incoming HTTP requests
- request classes validate input
- middleware runs before controller
- resources format JSON/API response data

How it connects:

- routes point to controllers
- middleware protects or prepares the request
- controller calls repositories/services

Simple example:

- admin product create form submits to a controller method in `Http/Controllers`

### `Listeners`

What it contains:

- event listener classes

Why it is used:

- to react when something important happens in the application
- keeps secondary work outside controller logic

How it connects:

- events are dispatched from controllers/services
- event service provider maps events to listeners
- listeners may call helpers, repositories, or jobs

Simple example:

- after product update, a listener refreshes indexes/search-related data

### `Observers`

What it contains:

- model observer classes

Why it is used:

- to react to model lifecycle events like created, updated, deleted

How it connects:

- provider registers observer on model
- when model event happens, observer runs automatically

Simple example:

- product observer deletes product media folder when a product is deleted

### `Helpers`

What it contains:

- utility classes
- reusable feature logic
- small focused helper functions

Why it is used:

- to avoid repeating logic
- to centralize calculations or formatting
- to provide simple feature-specific utilities

How it connects:

- controllers, repositories, listeners, jobs, views may call helpers

Simple example:

- Product helpers are used for search/index formatting and toolbar behavior

### `Providers`

What it contains:

- service provider classes
- event service providers
- module service providers

Why it is used:

- this is where package bootstrapping happens
- package routes/views/translations/config/migrations are registered here

How it connects:

- Laravel loads providers from `bootstrap/providers.php`
- Concord loads module providers from `config/concord.php`

Common types:

- normal service provider: boot package services
- event service provider: connect events and listeners
- module service provider: register models and module-level things with Concord

### `Repositories`

What it contains:

- DB access logic
- query logic
- create/update/delete helpers
- filtering and lookup methods

Why it is used:

- to keep controllers thinner
- to keep data access and business querying in one place
- to avoid scattering raw queries everywhere

How it connects:

- controller usually calls repository
- repository works with contracts/models
- repository may call other repositories/helpers

What a repository usually contains:

- `model()` method to tell Bagisto which model/contract it uses
- methods like `create`, `update`, `findBy...`, `getAll`, `search`, `copy`

Simple example:

- `ProductRepository` handles create/update/search/copy logic for products

Important note:

- in Bagisto, repository is often the first place to check when you want to know how data is fetched or saved

### `Services`

What it contains:

- higher-level business logic classes
- coordination logic across repositories/models/external systems

Why it is used:

- when logic is too big for controller or repository
- to organize feature workflows

How it connects:

- controller may call service
- service may call multiple repositories or APIs

Important note:

- not every package has a `Services` folder
- sometimes service-like behavior is kept in helpers, type classes, or other domain classes

Product example:

- Product package does not heavily use a `Services` folder
- its `Type` classes act like service-layer classes

### `Routes`

What it contains:

- route definitions

Why it is used:

- to map URL -> controller action

How it connects:

- provider loads routes
- routes apply middleware and prefixes
- routes point to controller methods

Simple example:

- admin product route points to ProductController methods

### `Jobs`

What it contains:

- queue job classes

Why it is used:

- for heavy or delayed work
- to keep request fast

How it connects:

- listener/controller/service dispatches job
- queue worker executes it

Simple example:

- after product update, Bagisto dispatches price/inventory/search indexing jobs

### `Resources`

What it contains:

- Blade views
- translations
- assets
- manifests

Why it is used:

- package UI and language files live here

How it connects:

- providers call `loadViewsFrom(...)`
- providers call `loadTranslationsFrom(...)`
- views render in admin or shop

Important note:

- some business packages only contain translations/manifests
- admin UI views often live in the `Admin` package instead

### `Models`

What it contains:

- Eloquent model classes
- relationships
- casts
- accessors
- model-level behavior

Why it is used:

- models represent database tables as PHP objects

How it connects:

- repository uses model
- controller receives data from repository
- listeners/jobs may also use model

Simple example:

- `Product` model defines relations like images, categories, variants, inventories

### `Contracts`

What it contains:

- interfaces for models or services

Why it is used:

- to decouple code from a concrete implementation
- to let Concord map contracts to actual model classes

How it connects:

- repository often returns a contract name
- Concord resolves that to the real model class

Simple example:

- Product repository points to `Webkul\Product\Contracts\Product`
- Concord maps that to the Product model implementation

### `Console`

What it contains:

- artisan command classes

Why it is used:

- to provide CLI commands
- useful for indexing, maintenance, sync, import/export, cron tasks

How it connects:

- provider registers commands
- Laravel artisan runs them

### `Type`

What it contains:

- type-specific domain behavior

Why it is used:

- some features have multiple subtypes with different behavior

How it connects:

- config maps type key to class
- model/repository asks for type instance
- type class handles type-specific operations

Product example:

- simple, configurable, bundle, virtual each have their own class

## 32. Why Bagisto Uses So Many Layers

As a beginner, it can feel like Bagisto uses too many files.

But each layer has a purpose:

- route: where request enters
- middleware: request checks/setup
- controller: request handling
- repository: data fetching/saving
- model: table relationships and object behavior
- listener: react after event
- job: heavy background work
- datagrid: admin listing behavior
- config: feature definition and settings
- provider: package bootstrapping

A simpler way to remember it:

- `provider` starts the package
- `route` catches the request
- `controller` receives the request
- `repository` gets/saves data
- `model` represents the DB
- `listener/job` do side work
- `resource/view/datagrid` shows output

## 33. What You Should Check First When Confused

If you open a package and feel lost, ask these questions:

1. Which provider loads this package?
2. Which routes enter this feature?
3. Which controller handles it?
4. Which repository is being called?
5. Which model/table is behind it?
6. Are any events dispatched?
7. Are listeners or jobs doing extra work?
8. Is the final output in a datagrid or view?

If you follow these questions in order, Bagisto becomes much easier to understand.

## 34. One Real Request Flow With Code

Let us take one real Bagisto admin example:

- admin opens product edit page

Example URL idea:

- `/admin/catalog/products/edit/1`

### Step 1: Route

Route lives in:

- `bagisto/packages/Webkul/Admin/src/Routes/catalog-routes.php`

Example:

```php
Route::get('edit/{id}', 'edit')->name('admin.catalog.products.edit');
```

Meaning:

- if this URL is requested
- call the `edit()` method of the controller

### Step 2: Controller

Controller:

- `bagisto/packages/Webkul/Admin/src/Http/Controllers/Catalog/ProductController.php`

Example:

```php
public function edit(int $id)
{
    $product = $this->productRepository->findOrFail($id);

    return view('admin::catalog.products.edit', compact('product'));
}
```

Meaning in simple words:

- get product by ID using repository
- send product data to Blade view

### Step 3: Repository

Repository:

- `bagisto/packages/Webkul/Product/src/Repositories/ProductRepository.php`

Repository uses model/contract logic to fetch the product.

In simple words:

- controller does not directly query database
- repository handles that data fetching

### Step 4: Model

Model:

- `bagisto/packages/Webkul/Product/src/Models/Product.php`

This model represents product data and relationships.

Examples:

```php
public function categories(): BelongsToMany
{
    return $this->belongsToMany(CategoryProxy::modelClass(), 'product_categories');
}
```

```php
public function images(): HasMany
{
    return $this->hasMany(ProductImageProxy::modelClass(), 'product_id')
        ->orderBy('position');
}
```

Meaning:

- product can have many categories
- product can have many images

### Step 5: View

The controller returns:

```php
return view('admin::catalog.products.edit', compact('product'));
```

Meaning:

- open the admin product edit Blade file
- use the `$product` variable in that page

So the full flow is:

`Route -> Controller -> Repository -> Model -> View`

## 35. One Real Save Flow With Code

Create/update flow is even more useful to understand.

### Controller dispatches event

From Product controller:

```php
Event::dispatch('catalog.product.update.before', $id);

$product = $this->productRepository->update($request->all(), $id);

Event::dispatch('catalog.product.update.after', $product);
```

Meaning:

1. tell the system product update is starting
2. call repository to update product
3. tell the system product update finished

### Repository decides product type logic

From Product repository:

```php
$product = $this->findOrFail($id);

$product = $product->getTypeInstance()->update($data, $id, $attributes);
```

Meaning:

- first find the product
- then ask its type class to do the actual update

### Model resolves type class

From Product model:

```php
$this->typeInstance = app(config('product_types.'.$this->type.'.class'));
```

Meaning:

- read config
- find correct class for this product type
- create that class

So Product update flow is:

`Controller -> Repository -> Model -> Config -> Type class -> DB save -> Event -> Listener/Jobs`

## 36. Dependency Injection In Easy Words

In many controllers you will see code like this:

```php
public function __construct(
    protected ProductRepository $productRepository
) {}
```

This is called dependency injection.

Simple meaning:

- controller needs `ProductRepository`
- Laravel automatically gives it
- controller does not manually create it

Why it is useful:

- cleaner code
- easier to test
- easier to swap implementations

## 37. Similar Concepts That Often Confuse Beginners

### Provider vs ModuleServiceProvider

`Provider`

- normal Laravel package startup class
- loads routes, views, translations, config, migrations, observers, events

`ModuleServiceProvider`

- used by Concord
- registers models/contracts/module-level items

Simple memory trick:

- provider boots the package
- module provider connects package models to Concord

### Model vs Repository

`Model`

- represents database table and relations

`Repository`

- contains query logic and save/find helper methods

Simple memory trick:

- model is the data object
- repository is the data access layer

### Listener vs Observer

`Listener`

- reacts to application events

`Observer`

- reacts to model lifecycle events like created/updated/deleted

Simple memory trick:

- listener watches app events
- observer watches model events

### Helper vs Service

`Helper`

- usually small reusable utility logic

`Service`

- usually larger business workflow logic

Important Bagisto note:

- some Bagisto packages use helper classes a lot
- some use type classes or other domain classes instead of a `Services` folder

### Config vs System Config

`Config`

- fixed code-based configuration in files

`System Config`

- admin-manageable configuration usually stored/read through system config setup

Simple memory trick:

- config file is developer-defined
- system config is admin-configurable

## 38. Bagisto Words In Very Simple Language

### Channel

- store/site context
- can affect theme, locale, currency, settings

### Locale

- language context

### Currency

- active money format/currency context

### Theme

- decides which views/assets should be used

### DataGrid

- Bagisto admin table/listing system

### Flat Table

- pre-prepared fast table used for listing/searching

### Contract

- interface or abstraction before actual implementation

### Concord

- module system Bagisto uses to connect contracts/models/packages

### Provider

- startup class that registers package behavior

## 39. How To Trace A Bug In Bagisto

When a page is broken or data is wrong, check in this order:

1. Route
2. Middleware
3. Controller
4. Repository
5. Model
6. View or DataGrid
7. Event
8. Listener
9. Job
10. Config

Example thought process:

1. Is the route going to the correct controller?
2. Is middleware changing request/auth/theme?
3. Is controller calling the expected repository?
4. Is repository fetching the correct model/data?
5. Is model relation returning correct data?
6. Is view/datagrid reading the correct variable?
7. Is any event firing after save?
8. Is any listener breaking something?
9. Is a queued job required for final data refresh?
10. Is config selecting unexpected behavior?

## 40. Why Bagisto Feels Confusing At First

This is normal.

Bagisto can feel confusing because:

- one feature is often split across multiple packages
- admin UI and business logic are often in different places
- many behaviors depend on config
- events and jobs do important work after the main request
- Concord adds another abstraction layer through contracts/modules

So if you feel lost, that does not mean you are weak.  
It just means Bagisto has a layered architecture and takes time to read comfortably.
