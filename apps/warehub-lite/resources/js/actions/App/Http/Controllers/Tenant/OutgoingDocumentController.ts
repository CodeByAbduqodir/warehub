import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Tenant\OutgoingDocumentController::pos
* @see app/Http/Controllers/Tenant/OutgoingDocumentController.php:48
* @route '/outgoing/pos'
*/
export const pos = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pos.url(options),
    method: 'get',
})

pos.definition = {
    methods: ["get","head"],
    url: '/outgoing/pos',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Tenant\OutgoingDocumentController::pos
* @see app/Http/Controllers/Tenant/OutgoingDocumentController.php:48
* @route '/outgoing/pos'
*/
pos.url = (options?: RouteQueryOptions) => {
    return pos.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Tenant\OutgoingDocumentController::pos
* @see app/Http/Controllers/Tenant/OutgoingDocumentController.php:48
* @route '/outgoing/pos'
*/
pos.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pos.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Tenant\OutgoingDocumentController::pos
* @see app/Http/Controllers/Tenant/OutgoingDocumentController.php:48
* @route '/outgoing/pos'
*/
pos.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: pos.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Tenant\OutgoingDocumentController::pos
* @see app/Http/Controllers/Tenant/OutgoingDocumentController.php:48
* @route '/outgoing/pos'
*/
const posForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: pos.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Tenant\OutgoingDocumentController::pos
* @see app/Http/Controllers/Tenant/OutgoingDocumentController.php:48
* @route '/outgoing/pos'
*/
posForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: pos.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Tenant\OutgoingDocumentController::pos
* @see app/Http/Controllers/Tenant/OutgoingDocumentController.php:48
* @route '/outgoing/pos'
*/
posForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: pos.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

pos.form = posForm

/**
* @see \App\Http\Controllers\Tenant\OutgoingDocumentController::posStore
* @see app/Http/Controllers/Tenant/OutgoingDocumentController.php:21
* @route '/outgoing/pos'
*/
export const posStore = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: posStore.url(options),
    method: 'post',
})

posStore.definition = {
    methods: ["post"],
    url: '/outgoing/pos',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Tenant\OutgoingDocumentController::posStore
* @see app/Http/Controllers/Tenant/OutgoingDocumentController.php:21
* @route '/outgoing/pos'
*/
posStore.url = (options?: RouteQueryOptions) => {
    return posStore.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Tenant\OutgoingDocumentController::posStore
* @see app/Http/Controllers/Tenant/OutgoingDocumentController.php:21
* @route '/outgoing/pos'
*/
posStore.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: posStore.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Tenant\OutgoingDocumentController::posStore
* @see app/Http/Controllers/Tenant/OutgoingDocumentController.php:21
* @route '/outgoing/pos'
*/
const posStoreForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: posStore.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Tenant\OutgoingDocumentController::posStore
* @see app/Http/Controllers/Tenant/OutgoingDocumentController.php:21
* @route '/outgoing/pos'
*/
posStoreForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: posStore.url(options),
    method: 'post',
})

posStore.form = posStoreForm

const OutgoingDocumentController = { pos, posStore }

export default OutgoingDocumentController