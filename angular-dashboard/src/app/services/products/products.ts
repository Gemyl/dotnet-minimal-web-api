import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateProduct, Product } from '../../models/products.model';

@Injectable({
  providedIn: 'root',
})

export class ProductsService {
  private _http = inject(HttpClient);

  public getProducts(): Observable<Product[]> {
    return this._http.get<Product[]>("http://localhost:5000/api/products");
  }

  public createProduct(payload: CreateProduct): Observable<Product> {
    return this._http.post<Product>("http://localhost:5000/api/products", payload);
  }
}
