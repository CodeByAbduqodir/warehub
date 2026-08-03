import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Tenant\StockController::index
* @see app/Http/Controllers/Tenant/StockController.php:21
* @route '/stock'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/stock',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Tenant\StockController::index
* @see app/Http/Controllers/Tenant/StockController.php:21
* @route '/stock'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Tenant\StockController::index
* @see app/Http/Controllers/Tenant/StockController.php:21
* @route '/stock'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Tenant\StockController::index
* @see app/Http/Controllers/Tenant/StockController.php:21
* @route '/stock'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Tenant\StockController::index
* @see app/Http/Controllers/Tenant/StockController.php:21
* @route '/stock'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Tenant\StockController::index
* @see app/Http/Controllers/Tenant/StockController.php:21
* @route '/stock'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Tenant\StockController::index
* @see app/Http/Controllers/Tenant/StockController.php:21
* @route '/stock'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\Tenant\StockController::create
* @see app/Http/Controllers/Tenant/StockController.php:51
* @route '/stock/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/stock/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Tenant\StockController::create
* @see app/Http/Controllers/Tenant/StockController.php:51
* @route '/stock/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Tenant\StockController::create
* @see app/Http/Controllers/Tenant/StockController.php:51
* @route '/stock/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Tenant\StockController::create
* @see app/Http/Controllers/Tenant/StockController.php:51
* @route '/stock/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Tenant\StockController::create
* @see app/Http/Controllers/Tenant/StockController.php:51
* @route '/stock/create'
*/
const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Tenant\StockController::create
* @see app/Http/Controllers/Tenant/StockController.php:51
* @route '/stock/create'
*/
createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Tenant\StockController::create
* @see app/Http/Controllers/Tenant/StockController.php:51
* @route '/stock/create'
*/
createForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

create.form = createForm

/**
* @see \App\Http\Controllers\Tenant\StockController::store
* @see app/Http/Controllers/Tenant/StockController.php:59
* @route '/stock'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/stock',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Tenant\StockController::store
* @see app/Http/Controllers/Tenant/StockController.php:59
* @route '/stock'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Tenant\StockController::store
* @see app/Http/Controllers/Tenant/StockController.php:59
* @route '/stock'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Tenant\StockController::store
* @see app/Http/Controllers/Tenant/StockController.php:59
* @route '/stock'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Tenant\StockController::store
* @see app/Http/Controllers/Tenant/StockController.php:59
* @route '/stock'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Tenant\StockController::edit
* @see app/Http/Controllers/Tenant/StockController.php:83
* @route '/stock/{stock}/edit'
*/
export const edit = (args: { stock: string | number | { id: string | number } } | [stock: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/stock/{stock}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Tenant\StockController::edit
* @see app/Http/Controllers/Tenant/StockController.php:83
* @route '/stock/{stock}/edit'
*/
edit.url = (args: { stock: string | number | { id: string | number } } | [stock: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { stock: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { stock: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            stock: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        stock: typeof args.stock === 'object'
        ? args.stock.id
        : args.stock,
    }

    return edit.definition.url
            .replace('{stock}', parsedArgs.stock.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Tenant\StockController::edit
* @see app/Http/Controllers/Tenant/StockController.php:83
* @route '/stock/{stock}/edit'
*/
edit.get = (args: { stock: string | number | { id: string | number } } | [stock: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Tenant\StockController::edit
* @see app/Http/Controllers/Tenant/StockController.php:83
* @route '/stock/{stock}/edit'
*/
edit.head = (args: { stock: string | number | { id: string | number } } | [stock: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Tenant\StockController::edit
* @see app/Http/Controllers/Tenant/StockController.php:83
* @route '/stock/{stock}/edit'
*/
const editForm = (args: { stock: string | number | { id: string | number } } | [stock: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Tenant\StockController::edit
* @see app/Http/Controllers/Tenant/StockController.php:83
* @route '/stock/{stock}/edit'
*/
editForm.get = (args: { stock: string | number | { id: string | number } } | [stock: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Tenant\StockController::edit
* @see app/Http/Controllers/Tenant/StockController.php:83
* @route '/stock/{stock}/edit'
*/
editForm.head = (args: { stock: string | number | { id: string | number } } | [stock: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

edit.form = editForm

/**
* @see \App\Http\Controllers\Tenant\StockController::update
* @see app/Http/Controllers/Tenant/StockController.php:90
* @route '/stock/{stock}'
*/
export const update = (args: { stock: string | number | { id: string | number } } | [stock: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/stock/{stock}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Tenant\StockController::update
* @see app/Http/Controllers/Tenant/StockController.php:90
* @route '/stock/{stock}'
*/
update.url = (args: { stock: string | number | { id: string | number } } | [stock: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { stock: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { stock: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            stock: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        stock: typeof args.stock === 'object'
        ? args.stock.id
        : args.stock,
    }

    return update.definition.url
            .replace('{stock}', parsedArgs.stock.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Tenant\StockController::update
* @see app/Http/Controllers/Tenant/StockController.php:90
* @route '/stock/{stock}'
*/
update.put = (args: { stock: string | number | { id: string | number } } | [stock: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Tenant\StockController::update
* @see app/Http/Controllers/Tenant/StockController.php:90
* @route '/stock/{stock}'
*/
update.patch = (args: { stock: string | number | { id: string | number } } | [stock: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Tenant\StockController::update
* @see app/Http/Controllers/Tenant/StockController.php:90
* @route '/stock/{stock}'
*/
const updateForm = (args: { stock: string | number | { id: string | number } } | [stock: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Tenant\StockController::update
* @see app/Http/Controllers/Tenant/StockController.php:90
* @route '/stock/{stock}'
*/
updateForm.put = (args: { stock: string | number | { id: string | number } } | [stock: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Tenant\StockController::update
* @see app/Http/Controllers/Tenant/StockController.php:90
* @route '/stock/{stock}'
*/
updateForm.patch = (args: { stock: string | number | { id: string | number } } | [stock: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\Tenant\StockController::destroy
* @see app/Http/Controllers/Tenant/StockController.php:97
* @route '/stock/{stock}'
*/
export const destroy = (args: { stock: string | number | { id: string | number } } | [stock: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/stock/{stock}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Tenant\StockController::destroy
* @see app/Http/Controllers/Tenant/StockController.php:97
* @route '/stock/{stock}'
*/
destroy.url = (args: { stock: string | number | { id: string | number } } | [stock: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { stock: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { stock: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            stock: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        stock: typeof args.stock === 'object'
        ? args.stock.id
        : args.stock,
    }

    return destroy.definition.url
            .replace('{stock}', parsedArgs.stock.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Tenant\StockController::destroy
* @see app/Http/Controllers/Tenant/StockController.php:97
* @route '/stock/{stock}'
*/
destroy.delete = (args: { stock: string | number | { id: string | number } } | [stock: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Tenant\StockController::destroy
* @see app/Http/Controllers/Tenant/StockController.php:97
* @route '/stock/{stock}'
*/
const destroyForm = (args: { stock: string | number | { id: string | number } } | [stock: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Tenant\StockController::destroy
* @see app/Http/Controllers/Tenant/StockController.php:97
* @route '/stock/{stock}'
*/
destroyForm.delete = (args: { stock: string | number | { id: string | number } } | [stock: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const StockController = { index, create, store, edit, update, destroy }

export default StockController