/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Authorigins = "_authOrigins",
	Externalauths = "_externalAuths",
	Mfas = "_mfas",
	Otps = "_otps",
	Superusers = "_superusers",
	CustomOptions = "custom_options",
	IngredientCategory = "ingredient_category",
	Ingredients = "ingredients",
	Orders = "orders",
	Salads = "salads",
	Subscriptions = "subscriptions",
	UserSalads = "user_salads",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

// System fields
export type BaseSystemFields<T = never> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
	expand?: T
}

export type AuthSystemFields<T = never> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created?: IsoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated?: IsoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated?: IsoDateString
}

export type MfasRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	method: string
	recordRef: string
	updated?: IsoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated?: IsoDateString
}

export type SuperusersRecord = {
	created?: IsoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated?: IsoDateString
	verified?: boolean
}

export enum CustomOptionsCategoryOptions {
	"base" = "base",
	"topping" = "topping",
	"dressing" = "dressing",
}
export type CustomOptionsRecord = {
	available?: boolean
	category: CustomOptionsCategoryOptions
	created?: IsoDateString
	id: string
	name: string
	price?: number
	updated?: IsoDateString
}

export type IngredientCategoryRecord = {
	created?: IsoDateString
	description?: string
	icon_name?: string
	id: string
	name?: string
	order?: number
	updated?: IsoDateString
}

export type IngredientsRecord = {
	available?: boolean
	calories?: number
	carbs?: number
	category?: RecordIdString
	created?: IsoDateString
	emoji?: string
	fats?: number
	id: string
	name?: string
	price?: number
	protein?: number
	updated?: IsoDateString
}

export enum OrdersStatusOptions {
	"pending" = "pending",
	"prepping" = "prepping",
	"ready" = "ready",
	"delivered" = "delivered",
	"cancelled" = "cancelled",
}
export type OrdersRecord<Titems = Record<string, number>, Titems_detail = Record<string, any>> = {
	created?: IsoDateString
	delivery?: boolean
	id: string
	items: null | Titems
	items_detail?: null | Titems_detail
	status?: OrdersStatusOptions
	total?: number
	updated?: IsoDateString
	user_id?: RecordIdString
}

export enum SaladsCategoryOptions {
	"featured" = "featured",
	"seasonal" = "seasonal",
	"protein" = "protein",
	"vegan" = "vegan",
	"light" = "light",
	"signature" = "signature",
}

export enum SaladsTagsOptions {
	"vegetarian" = "vegetarian",
	"vegan" = "vegan",
	"gluten-free" = "gluten-free",
	"high-protein" = "high-protein",
	"light" = "light",
	"seafood" = "seafood",
	"mediterranean" = "mediterranean",
	"detox" = "detox",
	"hearty" = "hearty",
	"chef-special" = "chef-special",
	"classic" = "classic",
	"popular" = "popular",
	"spicy" = "spicy",
}
export type SaladsRecord<Tadditional_nutrients = Record<string, string>, Tingredients = Array<{id: string, quantity: number}>> = {
	additional_nutrients?: null | Tadditional_nutrients
	available?: boolean
	calories?: number
	carbs?: number
	category?: SaladsCategoryOptions
	created?: IsoDateString
	description?: string
	display_order?: number
	fats?: number
	featured?: boolean
	id: string
	image?: string
	ingredients?: null | Tingredients
	name: string
	prep_time?: number
	price: number
	protein?: number
	seasonal?: boolean
	serving_size?: string
	story?: string
	tags?: SaladsTagsOptions[]
	updated?: IsoDateString
}

export enum SubscriptionsPlanOptions {
	"weekly" = "weekly",
	"monthly" = "monthly",
}
export type SubscriptionsRecord = {
	active?: boolean
	created?: IsoDateString
	id: string
	next_delivery: IsoDateString
	plan: SubscriptionsPlanOptions
	salads_per_week: number
	updated?: IsoDateString
	user_id: RecordIdString
}

export type UserSaladsRecord<Tingredients = Record<string, number>> = {
	created?: IsoDateString
	id: string
	ingredients: null | Tingredients
	is_favorite?: boolean
	name: string
	total_calories?: number
	total_carbs?: number
	total_fats?: number
	total_price: number
	total_protein?: number
	updated?: IsoDateString
	user_id: RecordIdString
}

export enum UsersRoleOptions {
	"customer" = "customer",
	"admin" = "admin",
}
export type UsersRecord = {
	avatar?: string
	created?: IsoDateString
	email: string
	emailVisibility?: boolean
	id: string
	name?: string
	password: string
	phone?: string
	points?: number
	role?: UsersRoleOptions
	tokenKey: string
	updated?: IsoDateString
	verified?: boolean
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type CustomOptionsResponse<Texpand = unknown> = Required<CustomOptionsRecord> & BaseSystemFields<Texpand>
export type IngredientCategoryResponse<Texpand = unknown> = Required<IngredientCategoryRecord> & BaseSystemFields<Texpand>
export type IngredientsResponse<Texpand = unknown> = Required<IngredientsRecord> & BaseSystemFields<Texpand>
export type OrdersResponse<Titems = Record<string, number>, Titems_detail = Record<string, any>, Texpand = unknown> = Required<OrdersRecord<Titems, Titems_detail>> & BaseSystemFields<Texpand>
export type SaladsResponse<Tadditional_nutrients = Record<string, string>, Tingredients = Array<{id: string, quantity: number}>, Texpand = unknown> = Required<SaladsRecord<Tadditional_nutrients, Tingredients>> & BaseSystemFields<Texpand>
export type SubscriptionsResponse<Texpand = unknown> = Required<SubscriptionsRecord> & BaseSystemFields<Texpand>
export type UserSaladsResponse<Tingredients = Record<string, number>, Texpand = unknown> = Required<UserSaladsRecord<Tingredients>> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	custom_options: CustomOptionsRecord
	ingredient_category: IngredientCategoryRecord
	ingredients: IngredientsRecord
	orders: OrdersRecord
	salads: SaladsRecord
	subscriptions: SubscriptionsRecord
	user_salads: UserSaladsRecord
	users: UsersRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	custom_options: CustomOptionsResponse
	ingredient_category: IngredientCategoryResponse
	ingredients: IngredientsResponse
	orders: OrdersResponse
	salads: SaladsResponse
	subscriptions: SubscriptionsResponse
	user_salads: UserSaladsResponse
	users: UsersResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: '_authOrigins'): RecordService<AuthoriginsResponse>
	collection(idOrName: '_externalAuths'): RecordService<ExternalauthsResponse>
	collection(idOrName: '_mfas'): RecordService<MfasResponse>
	collection(idOrName: '_otps'): RecordService<OtpsResponse>
	collection(idOrName: '_superusers'): RecordService<SuperusersResponse>
	collection(idOrName: 'custom_options'): RecordService<CustomOptionsResponse>
	collection(idOrName: 'ingredient_category'): RecordService<IngredientCategoryResponse>
	collection(idOrName: 'ingredients'): RecordService<IngredientsResponse>
	collection(idOrName: 'orders'): RecordService<OrdersResponse>
	collection(idOrName: 'salads'): RecordService<SaladsResponse>
	collection(idOrName: 'subscriptions'): RecordService<SubscriptionsResponse>
	collection(idOrName: 'user_salads'): RecordService<UserSaladsResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
}
