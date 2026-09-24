import { Component, signal, inject, OnInit } from '@angular/core';
import { ProductsService } from '../../services/products/products';
import { CreateProduct, Product } from '../../models/products.model';
import { form, FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-products',
  imports: [FormField],
  templateUrl: './products.html',
  providers: [ProductsService],
})
export class Products implements OnInit{
  public products: any = signal([]);
  public createProductModel = signal<CreateProduct>({
    name: '',
    price: null
  });
  public editProductModel = signal<Product>({
    id: '',
    name: '',
    price: null
  });
  public createProductForm = form(this.createProductModel);
  protected editProductForm = form(this.editProductModel);
  protected _productsService = inject(ProductsService);
  protected hoveredItemIndex = signal(-1);

  ngOnInit(): void {
    this._productsService.query.set({value: ''})
  }

  public onFormSubmit(event: Event) {
    event.preventDefault();
    this._productsService.createProduct(this.createProductModel()).subscribe((response) => {
      if(response.id) {
        console.log(`Product created with ID ${response.id}`);
        this._productsService.query.set({value: ''});
    }});
  }

  protected deleteProduct(id: string) {
    this._productsService.deleteProduct(id).subscribe((response) => {
      console.log(`Product with ID ${response} successfully deleted`);
      this._productsService.query.set({value: ''});
    });
  }

  protected selectProductForEdit(product: Product) {
    this.editProductModel.set(product);
  }

  protected saveChanges() {
    this._productsService.updateProduct(this.editProductModel())
    .subscribe((response: Product) => {
      console.log(response);
      this.cancelEdit();
      this._productsService.query.set({value: ''});
    });
  }

  protected cancelEdit() {
    this.editProductModel.set({
      id: '',
      name: '',
      price: null
    });
  }

  onItemHover(index: number) {
    this.hoveredItemIndex.set(index);
  }

  onItemLeave() {
    this.hoveredItemIndex.set(-1);
  }

}
