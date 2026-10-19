import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateProduct, Product, ProductsPagedResponse } from '../../../features/models/products.model';
import { httpResource } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})

export class ProductsService {
  private _http = inject(HttpClient);
  public query = signal({page: 1, pageSize: 10});
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private readonly productsUrl: string = environment.PRODUCTS_URl;

  productsResource = httpResource<ProductsPagedResponse>(() => {
    if (!this.isBrowser) return undefined;
    return `${this.productsUrl}?page=${this.query().page}&pageSize=${this.query().pageSize}`
  }, {
    defaultValue: undefined,
  });

  public createProduct(payload: CreateProduct): Observable<Product> {
    return this._http.post<Product>(this.productsUrl, payload);
  }

  public deleteProduct(param: string): Observable<number> {
    return this._http.delete<number>(`${this.productsUrl}/${param}`);
  }

  public updateProduct(payload: Product): Observable<Product> {
    return this._http.put<Product>(this.productsUrl, payload);
  }

}
