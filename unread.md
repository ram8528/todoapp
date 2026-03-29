# 1. Sales Order Issues
Bagisto core must remain untouched.

I have a custom package named `RecurringSubscription`. After integrating it, `/admin/sales/orders/view/{id}` breaks. Bagisto works correctly without my package, so the issue is in my package.

Your task:

- Trace the real failure path
- Fix the issue only inside my package
- Do not edit or override any Bagisto core files
- Do not replace the core admin order view/controller with custom copies
- Use Bagisto extension points only, such as package service providers, event listeners, `view_render_event`, package Blade views, repositories, and null-safe logic

Rules:

- No changes in existing Bagisto core packages
- No direct override of `packages/Webkul/Admin/src/Resources/views/sales/orders/view.blade.php`
- No direct override of the core order controller
- Any recurring-subscription logic must be optional and must not break normal orders
- Old or non-recurring orders may have no recurring-subscription record, and the page must still load normally

Please inspect:

- the route/controller/view flow for `/admin/sales/orders/view/{id}`
- my package providers
- any package event listeners
- any Blade partials injected into the order page
- any repository/model/helper code reading recurring subscription data from orders
- any null access or invalid assumptions

What I want back:

- the root cause
- the package-only fix
- the list of changed files
- confirmation that no core files were modified

## 2. Image Issues
Bagisto core must not be modified.

Problem:
When I upload a product image on `/admin/catalog/products/edit/{id}`, the image appears on the edit page, but it does not appear in:

- `/admin/catalog/products` product datagrid
- `/admin/sales/orders/view/{id}` order item image blocks

Bagisto works correctly without my custom package, so this is likely caused by my package integration.

Task:
Trace the real product image flow and fix the issue only inside my package.

Important constraints:

- Do not edit Bagisto core files
- Do not override core product grid views
- Do not override core sales order views
- Do not patch core image accessors/controllers as a shortcut
- Fix the root cause in my package only

Please inspect:

1. product update/save flow
2. any package listeners on `catalog.product.update.before/after` or related events
3. any package code modifying product media, image paths, or product relations
4. whether my package affects `product_images` persistence
5. whether my package affects the order item -> product relation or product image access

Relevant Bagisto behavior:

- admin product grid reads image from `product_images.path`
- admin order view reads image via `$item->product?->base_image_url`
- product base image accessor depends on product `images()` relation
- image upload persistence is handled through product media repository/type update flow

Expected result:

- uploaded product images must persist correctly
- product image must appear in product datagrid
- product image must appear in admin sales order view
- no Bagisto core changes

Deliverables:

- identify exact package-side root cause
- apply package-only fix
- list changed files
- confirm no core files were modified

### 3. Debug first Prompt
Debug this carefully before changing code.

Context:
Bagisto runs fine on its own. After integrating my custom `RecurringSubscription` package, `/admin/sales/orders/view/{id}` fails.

Goal:
Find the exact package-level cause and fix it without touching Bagisto core.

Constraints:

- No core edits
- No core view/controller overrides
- Fix must stay inside my package
- Prefer inspection first, then minimal safe changes

Please do this in order:

1. Trace the route/controller/view flow for `/admin/sales/orders/view/{id}`
2. Find where my package is being executed during that page render
3. Identify the exact failing package code path
4. Explain whether it is a provider, event listener, Blade partial, repository query, helper, relation, observer, or null access problem
5. Fix it only in my package using Bagisto-supported extension patterns

Important:

- If my package adds UI to the admin order view, move or keep that logic in package event listeners and package views only
- If recurring data is absent, render nothing and let the core page continue normally
- Do not silently introduce a core override as a shortcut

After fixing:

- summarize root cause
- list changed files
- state explicitly that no core files were changed

#### . Debug  
Do not change code yet.

Bagisto works fine without my custom package. After integrating my package, `/admin/sales/orders/view/{id}` breaks and product images are missing in admin product grid and admin sales order pages.

Trace the exact failure path and identify the root cause only inside my package.

Rules:

- no code changes yet
- no core edits
- inspect package providers, listeners, views, repositories, model relations, and product/order integrations
- tell me the exact files and logic responsible

5.  Fix
    Now apply the fix only inside my package.

Rules:

- no Bagisto core changes
- no overriding core views/controllers
- use package event listeners, repositories, null-safe logic, and Bagisto extension points
- remove any bad core override approach if present

Fix the root cause you found and list changed files.

6. Verify
   Review the final implementation.

Confirm:

- no core files were changed
- no core views/controllers are overridden
- the package now uses Bagisto-supported extension points
- non-recurring orders and normal products still work safely
- product images render correctly where expected
