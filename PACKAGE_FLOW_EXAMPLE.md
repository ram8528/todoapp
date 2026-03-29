# One Package Example: Product Flow In Easy Language

This note explains one real Bagisto feature in simple words:

- how route, controller, repository, model, config, providers, and Concord connect
- using the **Product** feature as the example

Important note:

In Bagisto, one feature is often split across packages.

For Product:

- admin UI lives mostly in `bagisto/packages/Webkul/Admin`
- product business logic lives mostly in `bagisto/packages/Webkul/Product`

So when we say "one package example", we mean **one feature example**, mainly centered around the Product package.

## 1. The Simple Big Picture

The easiest way to understand Bagisto Product flow is:

`Provider -> Route -> Controller -> Repository -> Model -> Database`

And around it:

`Config -> decides behavior`
`Concord -> connects contracts/models`
`Events/Listeners/Jobs -> do extra work after save`

## 2. First: How Product Package Gets Loaded

Before any product page works, Bagisto must load the Product package.

### Normal Laravel provider loading

Bagisto loads service providers from:

- `bagisto/bootstrap/providers.php`

Inside that file, Laravel registers:

- `Webkul\Product\Providers\ProductServiceProvider`

File:

- [`ProductServiceProvider.php`](/e:/bagisto/bagisto/packages/Webkul/Product/src/Providers/ProductServiceProvider.php)

This provider is the startup file for the Product package.

What it does:

- includes helper functions
- merges product config
- loads migrations
- loads translations
- registers observer
- registers event service provider

So in easy words:

- **provider is the entry point of the package**

### Concord module loading

Bagisto also uses Concord from:

- `bagisto/config/concord.php`

There the Product module provider is registered:

- `Webkul\Product\Providers\ModuleServiceProvider`

File:

- [`ModuleServiceProvider.php`](/e:/bagisto/bagisto/packages/Webkul/Product/src/Providers/ModuleServiceProvider.php)

This provider registers Product models with Concord.

So:

- `ProductServiceProvider` boots package behavior
- `ModuleServiceProvider` registers models/contracts at module level

## 3. Where Config Comes In

Product config file:

- [`product_types.php`](/e:/bagisto/bagisto/packages/Webkul/Product/src/Config/product_types.php)

This file says:

- if product type is `simple`, use `Webkul\Product\Type\Simple`
- if product type is `configurable`, use `Webkul\Product\Type\Configurable`
- if type is `bundle`, use `Webkul\Product\Type\Bundle`

Why this is useful:

- Bagisto does not hardcode all product behavior in one place
- config decides which class should handle each product type

So config is used to answer:

- "what behavior class should Bagisto use?"

## 4. Where the Admin Route Starts

Now suppose an admin user opens product page.

Admin product routes are in:

- [`catalog-routes.php`](/e:/bagisto/bagisto/packages/Webkul/Admin/src/Routes/catalog-routes.php)

Examples:

- `admin.catalog.products.index`
- `admin.catalog.products.store`
- `admin.catalog.products.edit`
- `admin.catalog.products.update`

So the route is the first thing that catches the browser request.

In easy words:

- **route decides which controller method should run**

## 5. Where Controller Comes In

The admin route points to:

- [`ProductController.php`](/e:/bagisto/bagisto/packages/Webkul/Admin/src/Http/Controllers/Catalog/ProductController.php)

This controller is the request manager.

What it does:

- receives request
- validates input
- calls repository
- fires events
- returns view or response

Examples:

- `index()` shows product list page
- `store()` creates product
- `edit()` loads product edit page
- `update()` updates product

In easy words:

- **controller does not want to do all DB logic itself**
- it mostly coordinates the work

## 6. Where Repository Comes In

The controller uses:

- [`ProductRepository.php`](/e:/bagisto/bagisto/packages/Webkul/Product/src/Repositories/ProductRepository.php)

This is the data/business access layer for Product.

What repository does:

- find product
- create product
- update product
- search products
- copy product
- apply filtering logic

In easy words:

- controller says: "please save/find product"
- repository says: "I know how to do that"

So the connection is:

`Controller -> Repository`

You can see this because the repository is injected into the controller constructor.

## 7. Where Model Comes In

The main product model is:

- [`Product.php`](/e:/bagisto/bagisto/packages/Webkul/Product/src/Models/Product.php)

This model represents the product data in the database.

What model contains:

- table-related fields
- relationships
- casts
- product-specific model behavior

Examples of relations:

- `categories()`
- `images()`
- `variants()`
- `price_indices()`
- `inventory_indices()`

In easy words:

- **model is the PHP representation of DB data**

So the connection is:

`Repository -> Model -> Database`

## 8. Where Contract and Concord Come In

Product contract:

- [`Contracts/Product.php`](/e:/bagisto/bagisto/packages/Webkul/Product/src/Contracts/Product.php)

Repository often points to the contract, not directly to the model.

Why?

Because Bagisto uses Concord to map:

- contract -> real model

So conceptually the flow is:

`Repository -> Contract -> Concord -> Model`

In easy language:

- contract is like a promise or label
- Concord decides which real model fulfills that promise

This gives Bagisto flexibility.

## 9. Where Product Type Classes Come In

Main type base class:

- [`AbstractType.php`](/e:/bagisto/bagisto/packages/Webkul/Product/src/Type/AbstractType.php)

This is one of the most important parts.

When repository creates or updates a product, it does not do all logic itself.

Instead, it checks product type and uses the correct type class.

Examples:

- `Simple`
- `Configurable`
- `Bundle`
- `Virtual`

Why?

Because each product type behaves differently.

These type classes handle things like:

- create product
- update product
- save custom attributes
- sync categories
- sync channels
- save images/videos
- save inventories
- prepare cart behavior
- calculate prices

So in Product feature:

- **type classes act like the real service layer**

Even though the folder name is `Type`, they do a lot of service-like work.

## 10. Real Create Flow

Now let us see the actual simple create flow.

### Step 1

Admin submits product create form.

### Step 2

Route from:

- [`catalog-routes.php`](/e:/bagisto/bagisto/packages/Webkul/Admin/src/Routes/catalog-routes.php)

matches request and sends it to:

- `ProductController@store`

### Step 3

Controller validates request.

### Step 4

Controller calls:

- `ProductRepository->create(...)`

### Step 5

Repository reads product type config from:

- [`product_types.php`](/e:/bagisto/bagisto/packages/Webkul/Product/src/Config/product_types.php)

### Step 6

Repository creates the correct type class, for example:

- `Webkul\Product\Type\Simple`

### Step 7

That type class creates the product model and saves related data.

### Step 8

Controller fires event:

- `catalog.product.create.after`

### Step 9

Listener catches event and updates extra data like indexes/search.

So short version:

`Route -> Controller -> Repository -> Type class -> Model -> DB`

## 11. Real Update Flow

Update is similar.

### Step 1

Admin submits product edit form.

### Step 2

Route sends request to:

- `ProductController@update`

### Step 3

Controller calls:

- `ProductRepository->update(...)`

### Step 4

Repository finds the product model

### Step 5

Repository asks the product type class to perform the update

### Step 6

Type class updates:

- product fields
- attribute values
- categories
- channels
- images/videos
- inventory
- customer group prices

### Step 7

Controller fires update event

### Step 8

Listener and jobs refresh flat/index/search data

## 12. Where Events, Listeners, and Jobs Come In

Event registration file:

- [`EventServiceProvider.php`](/e:/bagisto/bagisto/packages/Webkul/Product/src/Providers/EventServiceProvider.php)

Listener:

- [`Listeners/Product.php`](/e:/bagisto/bagisto/packages/Webkul/Product/src/Listeners/Product.php)

Jobs:

- [`UpdateCreatePriceIndex.php`](/e:/bagisto/bagisto/packages/Webkul/Product/src/Jobs/UpdateCreatePriceIndex.php)
- `UpdateCreateInventoryIndex.php`
- elasticsearch jobs

Why they are used:

after saving a product, Bagisto still needs to refresh other data such as:

- flat table data
- inventory index
- price index
- search index

So Bagisto does:

- main save first
- extra refresh work after that

This keeps logic organized.

## 13. Where Observer Comes In

Observer:

- [`ProductObserver.php`](/e:/bagisto/bagisto/packages/Webkul/Product/src/Observers/ProductObserver.php)

Registered by:

- `ProductServiceProvider`

This observer runs on model lifecycle events.

Example:

- when a product is deleted, it removes product media folder from storage

So:

- listeners react to application events
- observers react to model events

## 14. Where DataGrid Comes In

Admin product listing uses:

- [`ProductDataGrid.php`](/e:/bagisto/bagisto/packages/Webkul/Admin/src/DataGrids/Catalog/ProductDataGrid.php)

This is not part of create/update saving, but it is part of how admin pages work.

It handles:

- table query
- filters
- sorting
- columns
- actions

So when admin opens product list page:

- controller asks datagrid to process
- datagrid builds the listing response

## 15. Very Easy Relationship Summary

Here is the easiest way to remember how all things are connected:

### Providers

- start and register the package

### Config

- tells the package what behavior/classes/settings to use

### Routes

- catch URL requests

### Controller

- handles request and decides what should happen

### Repository

- contains data access and business query logic

### Contract

- gives abstraction for the model

### Concord

- maps contract to real model

### Model

- represents database table and relations

### Type class

- performs detailed product-specific business logic

### Listener/Job

- do extra work after save

## 16. Final One-Line Summary

For Product feature in Bagisto, the working is:

`Provider loads package -> Route catches request -> Controller handles request -> Repository manages data logic -> Contract/Concord resolve model -> Model saves data -> Events trigger listeners/jobs -> indexes and extra data are refreshed`

## 17. Small Beginner Memory Trick

If you ever get confused, ask in this order:

1. Which provider loads this?
2. Which route enters this feature?
3. Which controller handles it?
4. Which repository is called?
5. Which model/table is used?
6. Is config deciding any class or behavior?
7. Are events/listeners/jobs doing extra work after save?

If you follow this sequence, Bagisto becomes much easier to understand.
