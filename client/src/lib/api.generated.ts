/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface DtosCategoryCreateDTO {
  /** @maxLength 20 */
  name: string;
}

export interface DtosCategoryReadDTO {
  id?: number;
  name?: string;
}

export interface DtosCategoryUpdateDTO {
  id: number;
  /** @maxLength 20 */
  name: string;
}

export interface DtosErrResp {
  error?: string;
  path?: string;
  timestamp?: string;
}

export interface DtosLevelCreateDTO {
  img_uri: string;
  /** @maxLength 20 */
  name: string;
}

export interface DtosLevelReadDTO {
  id?: number;
  img_uri?: string;
  name?: string;
}

export interface DtosLevelUpdateDTO {
  id: number;
  img_uri: string;
  /** @maxLength 20 */
  name: string;
}

export interface DtosPlayerProfileAppendDTO {
  /** @maxLength 20 */
  display_name: string;
}

export interface DtosPlayerProfileCreateDTO {
  /** @maxLength 20 */
  display_name: string;
  user_id: number;
}

export interface DtosPlayerProfileReadDTO {
  coins?: number;
  display_name?: string;
  id?: number;
  last_login?: string;
}

export interface DtosPlayerProfileUpdateDTO {
  coins?: number;
  /** @maxLength 20 */
  display_name: string;
  id: number;
}

export interface DtosRoleCreateDTO {
  /** @maxLength 7 */
  name: string;
}

export interface DtosRoleReadDTO {
  id?: number;
  name?: string;
}

export interface DtosRoleUpdateDTO {
  id: number;
  /** @maxLength 7 */
  name: string;
}

export interface DtosTokenRefreshRequest {
  refreshToken: string;
}

export interface DtosUserCreateDTO {
  /** @maxLength 30 */
  email: string;
  /**
   * @minLength 8
   * @maxLength 50
   */
  password: string;
  role_id: number;
  /**
   * @minLength 3
   * @maxLength 20
   */
  username: string;
}

export interface DtosUserLoginDTO {
  email: string;
  password: string;
}

export interface DtosUserReadDTO {
  email?: string;
  id?: number;
  is_banned?: boolean;
  last_login?: string;
  role?: string;
}

export interface DtosUserUpdateDTO {
  /** @maxLength 30 */
  email: string;
  id: number;
  role_id?: number;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "/api";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter((key) => "undefined" !== typeof query[key]);
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string" ? JSON.stringify(input) : input,
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input;
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData());
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
        },
        signal: (cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal) || null,
        body: typeof body === "undefined" || body === null ? null : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const responseToParse = responseFormat ? response.clone() : response;
      const data = !responseFormat
        ? r
        : await responseToParse[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title SMAASH API documentation
 * @version 1.0
 * @license MIT
 * @termsOfService http://swagger.io/terms/
 * @baseUrl /api
 * @contact
 *
 * This site documents the endpoints for the smaash web app, allowing easy testing
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  auth = {
    /**
     * @description Logs in a user
     *
     * @tags auth
     * @name LoginCreate
     * @request POST:/auth/login
     */
    loginCreate: (user_login_dto: DtosUserLoginDTO, params: RequestParams = {}) =>
      this.request<int, DtosErrResp>({
        path: `/auth/login`,
        method: "POST",
        body: user_login_dto,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Logs out a user
     *
     * @tags auth
     * @name LogoutCreate
     * @request POST:/auth/logout
     */
    logoutCreate: (params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/auth/logout`,
        method: "POST",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Register a new user
     *
     * @tags auth
     * @name SignupCreate
     * @request POST:/auth/signup
     */
    signupCreate: (user_create_dto: DtosUserCreateDTO, params: RequestParams = {}) =>
      this.request<DtosUserReadDTO, DtosErrResp>({
        path: `/auth/signup`,
        method: "POST",
        body: user_create_dto,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  categories = {
    /**
     * @description Reads categories
     *
     * @tags categories
     * @name CategoriesList
     * @request GET:/categories
     */
    categoriesList: (params: RequestParams = {}) =>
      this.request<DtosCategoryReadDTO[], DtosErrResp>({
        path: `/categories`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Creates a new category
     *
     * @tags categories
     * @name CategoriesCreate
     * @request POST:/categories
     */
    categoriesCreate: (category_create_dto: DtosCategoryCreateDTO, params: RequestParams = {}) =>
      this.request<DtosCategoryReadDTO, DtosErrResp>({
        path: `/categories`,
        method: "POST",
        body: category_create_dto,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Reads a category by it's id
     *
     * @tags categories
     * @name CategoriesDetail
     * @request GET:/categories/{id}
     */
    categoriesDetail: (id: number, params: RequestParams = {}) =>
      this.request<DtosCategoryReadDTO, DtosErrResp>({
        path: `/categories/${id}`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Updates the category with the given id
     *
     * @tags categories
     * @name CategoriesUpdate
     * @request PUT:/categories/{id}
     */
    categoriesUpdate: (
      id: number,
      category_update_dto: DtosCategoryUpdateDTO,
      params: RequestParams = {},
    ) =>
      this.request<any, DtosErrResp>({
        path: `/categories/${id}`,
        method: "PUT",
        body: category_update_dto,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Deletes a category with the given id
     *
     * @tags categories
     * @name CategoriesDelete
     * @request DELETE:/categories/{id}
     */
    categoriesDelete: (id: number, params: RequestParams = {}) =>
      this.request<any, DtosErrResp>({
        path: `/categories/${id}`,
        method: "DELETE",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  gameLogin = {
    /**
     * @description Logs a user into the game
     *
     * @tags game-auth
     * @name GameLoginCreate
     * @request POST:/game-login
     */
    gameLoginCreate: (user_login_dto: DtosUserLoginDTO, params: RequestParams = {}) =>
      this.request<int, DtosErrResp>({
        path: `/game-login`,
        method: "POST",
        body: user_login_dto,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  gameRefresh = {
    /**
     * @description Asks for a refresh token
     *
     * @tags game-auth
     * @name GameRefreshCreate
     * @request POST:/game-refresh
     */
    gameRefreshCreate: (user_login_dto: DtosTokenRefreshRequest, params: RequestParams = {}) =>
      this.request<int, DtosErrResp>({
        path: `/game-refresh`,
        method: "POST",
        body: user_login_dto,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  levels = {
    /**
     * @description Reads all levels
     *
     * @tags levels
     * @name LevelsList
     * @request GET:/levels
     */
    levelsList: (params: RequestParams = {}) =>
      this.request<DtosLevelReadDTO[], DtosErrResp>({
        path: `/levels`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Creates a new level
     *
     * @tags levels
     * @name LevelsCreate
     * @request POST:/levels
     */
    levelsCreate: (level_create_dto: DtosLevelCreateDTO, params: RequestParams = {}) =>
      this.request<DtosLevelReadDTO, DtosErrResp>({
        path: `/levels`,
        method: "POST",
        body: level_create_dto,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Reads a level by it's id
     *
     * @tags levels
     * @name LevelsDetail
     * @request GET:/levels/{id}
     */
    levelsDetail: (id: number, params: RequestParams = {}) =>
      this.request<DtosLevelReadDTO, DtosErrResp>({
        path: `/levels/${id}`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Updates the level with the given id
     *
     * @tags levels
     * @name LevelsUpdate
     * @request PUT:/levels/{id}
     */
    levelsUpdate: (id: number, level_update_dto: DtosLevelUpdateDTO, params: RequestParams = {}) =>
      this.request<any, DtosErrResp>({
        path: `/levels/${id}`,
        method: "PUT",
        body: level_update_dto,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Deletes a level with the given id
     *
     * @tags levels
     * @name LevelsDelete
     * @request DELETE:/levels/{id}
     */
    levelsDelete: (id: number, params: RequestParams = {}) =>
      this.request<any, DtosErrResp>({
        path: `/levels/${id}`,
        method: "DELETE",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  profiles = {
    /**
     * @description Reads all profile
     *
     * @tags profiles
     * @name ProfilesList
     * @request GET:/profiles
     */
    profilesList: (params: RequestParams = {}) =>
      this.request<DtosPlayerProfileReadDTO[], DtosErrResp>({
        path: `/profiles`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Creates a new profile
     *
     * @tags profiles
     * @name ProfilesCreate
     * @request POST:/profiles
     */
    profilesCreate: (profile_create_dto: DtosPlayerProfileCreateDTO, params: RequestParams = {}) =>
      this.request<DtosPlayerProfileReadDTO, DtosErrResp>({
        path: `/profiles`,
        method: "POST",
        body: profile_create_dto,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Reads a user by it's id
     *
     * @tags profiles
     * @name ProfilesDetail
     * @request GET:/profiles/{id}
     */
    profilesDetail: (id: number, params: RequestParams = {}) =>
      this.request<DtosPlayerProfileReadDTO, DtosErrResp>({
        path: `/profiles/${id}`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Updates the profile with the given id
     *
     * @tags profiles
     * @name ProfilesUpdate
     * @request PUT:/profiles/{id}
     */
    profilesUpdate: (
      id: number,
      profile_update_dto: DtosPlayerProfileUpdateDTO,
      params: RequestParams = {},
    ) =>
      this.request<any, DtosErrResp>({
        path: `/profiles/${id}`,
        method: "PUT",
        body: profile_update_dto,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Deletes a profile with the given id
     *
     * @tags profiles
     * @name ProfilesDelete
     * @request DELETE:/profiles/{id}
     */
    profilesDelete: (id: number, params: RequestParams = {}) =>
      this.request<any, DtosErrResp>({
        path: `/profiles/${id}`,
        method: "DELETE",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns an uploaded profile picture
     *
     * @tags profiles
     * @name GetProfiles
     * @request GET:/profiles/{id}/pfp
     */
    getProfiles: (id: number, params: RequestParams = {}) =>
      this.request<any, DtosErrResp>({
        path: `/profiles/${id}/pfp`,
        method: "GET",
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Uploads a profile picture
     *
     * @tags profiles
     * @name PostProfiles
     * @request POST:/profiles/{id}/pfp
     */
    postProfiles: (id: number, data?: any, params: RequestParams = {}) =>
      this.request<string, DtosErrResp>({
        path: `/profiles/${id}/pfp`,
        method: "POST",
        body: data,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),
  };
  roles = {
    /**
     * @description Reads all roles
     *
     * @tags roles
     * @name RolesList
     * @request GET:/roles
     */
    rolesList: (params: RequestParams = {}) =>
      this.request<DtosRoleReadDTO[], DtosErrResp>({
        path: `/roles`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Creates a new role
     *
     * @tags roles
     * @name RolesCreate
     * @request POST:/roles
     */
    rolesCreate: (role_create_dto: DtosRoleCreateDTO, params: RequestParams = {}) =>
      this.request<DtosRoleReadDTO, DtosErrResp>({
        path: `/roles`,
        method: "POST",
        body: role_create_dto,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Reads a role by it's id
     *
     * @tags roles
     * @name RolesDetail
     * @request GET:/roles/{id}
     */
    rolesDetail: (id: number, params: RequestParams = {}) =>
      this.request<DtosRoleReadDTO, DtosErrResp>({
        path: `/roles/${id}`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Updates the role with the given id
     *
     * @tags roles
     * @name RolesUpdate
     * @request PUT:/roles/{id}
     */
    rolesUpdate: (id: number, role_update_dto: DtosRoleUpdateDTO, params: RequestParams = {}) =>
      this.request<any, DtosErrResp>({
        path: `/roles/${id}`,
        method: "PUT",
        body: role_update_dto,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Deletes a role with the given id
     *
     * @tags roles
     * @name RolesDelete
     * @request DELETE:/roles/{id}
     */
    rolesDelete: (id: number, params: RequestParams = {}) =>
      this.request<any, DtosErrResp>({
        path: `/roles/${id}`,
        method: "DELETE",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  users = {
    /**
     * @description Reads all users
     *
     * @tags users
     * @name UsersList
     * @request GET:/users
     */
    usersList: (params: RequestParams = {}) =>
      this.request<DtosUserReadDTO[], DtosErrResp>({
        path: `/users`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Reads a user by id
     *
     * @tags users
     * @name UsersDetail
     * @request GET:/users/{id}
     */
    usersDetail: (userId: number, id: string, params: RequestParams = {}) =>
      this.request<DtosUserReadDTO, DtosErrResp>({
        path: `/users/${id}`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Updates the user with the given id. (Cannot modify the users password)
     *
     * @tags users
     * @name UsersUpdate
     * @request PUT:/users/{id}
     */
    usersUpdate: (id: number, user_update_dto: DtosUserUpdateDTO, params: RequestParams = {}) =>
      this.request<any, DtosErrResp>({
        path: `/users/${id}`,
        method: "PUT",
        body: user_update_dto,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Deletes a user with the given id
     *
     * @tags users
     * @name UsersDelete
     * @request DELETE:/users/{id}
     */
    usersDelete: (id: number, params: RequestParams = {}) =>
      this.request<any, DtosErrResp>({
        path: `/users/${id}`,
        method: "DELETE",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Reads all profiles of a given user
     *
     * @tags users
     * @name ProfilesList
     * @request GET:/users/{id}/profiles
     */
    profilesList: (userId: number, id: string, params: RequestParams = {}) =>
      this.request<DtosPlayerProfileReadDTO[], DtosErrResp>({
        path: `/users/${id}/profiles`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Creates a new profile for a given user
     *
     * @tags users
     * @name ProfilesCreate
     * @request POST:/users/{id}/profiles
     */
    profilesCreate: (
      userId: number,
      id: string,
      profile_append_dto: DtosPlayerProfileAppendDTO,
      params: RequestParams = {},
    ) =>
      this.request<DtosPlayerProfileReadDTO, DtosErrResp>({
        path: `/users/${id}/profiles`,
        method: "POST",
        body: profile_append_dto,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
