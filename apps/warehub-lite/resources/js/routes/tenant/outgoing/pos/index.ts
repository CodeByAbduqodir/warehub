import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Tenant\OutgoingDocumentController::store
* @see app/Http/Controllers/Tenant/OutgoingDocumentController.php:21
* @route '/outgoing/pos'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/outgoing/pos',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Tenant\OutgoingDocumentController::store
* @see app/Http/Controllers/Tenant/OutgoingDocumentController.php:21
* @route '/outgoing/pos'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Tenant\OutgoingDocumentController::store
* @see app/Http/Controllers/Tenant/OutgoingDocumentController.php:21
* @route '/outgoing/pos'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Tenant\OutgoingDocumentController::store
* @see app/Http/Controllers/Tenant/OutgoingDocumentController.php:21
* @route '/outgoing/pos'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Tenant\OutgoingDocumentController::store
* @see app/Http/Controllers/Tenant/OutgoingDocumentController.php:21
* @route '/outgoing/pos'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

const pos = {
    store: Object.assign(store, store),
}

export default pos