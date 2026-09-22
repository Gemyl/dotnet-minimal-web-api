import { Component, signal, inject, OnInit } from '@angular/core';
import { ProductsService } from '../../services/products/products';
import { CreateProduct } from '../../models/products.model';
import { form, FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-products',
  imports: [FormField],
  templateUrl: './products.html',
  providers: [ProductsService],
})
export class Products implements OnInit{
  public products: any = signal([]);
  public loginModel = signal<CreateProduct>({
    name: '',
    price: null
  });
  public loginForm = form(this.loginModel);
  protected _productsService = inject(ProductsService);

  ngOnInit(): void {
    this._productsService.query.set({value: ''})
  }

  public onFormSubmit(event: Event) {
    event.preventDefault();
    this._productsService.createProduct(this.loginModel()).subscribe((response) => {
      if(response.id) {
        console.log(`Product created with ID ${response.id}`);
        this._productsService.query.set({value: ''});
    }});
  }

  protected deleteProduct(id: number) {
    this._productsService.deleteProduct(id).subscribe((response) => {
      console.log(`Product with ID ${response} successfully deleted`);
      this._productsService.query.set({value: ''});
    });
  }

}
