import { Component, signal, OnInit, inject } from '@angular/core';
import { ProductsService } from '../../services/products/products';
import { CreateProduct, Product } from '../../models/products.model';
import { form, FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-products',
  imports: [FormField],
  templateUrl: './products.html',
  styleUrl: './products.css',
  providers: [ProductsService],
})
export class Products implements OnInit{
  public products: any = signal([]);
  public loginModel = signal<CreateProduct>({
    name: '',
    price: null
  });
  public loginForm = form(this.loginModel);
  private _productsService = inject(ProductsService);

  ngOnInit(): void {
    this.getProducts();
  }

  private getProducts():void {
    this._productsService.getProducts().subscribe(
      (response) => {
        this.products.set(response);
      }
    )
  }

  public onFormSubmit(event: Event) {
    event.preventDefault();
    this._productsService.createProduct(this.loginModel()).subscribe((response) => {
      if(response.id) {
        console.log(`Product created with ID ${response.id}`);
        this.getProducts();
    }});
  }

}
