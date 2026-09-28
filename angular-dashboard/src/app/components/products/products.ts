import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { ProductsService } from '../../services/products/products';
import { CreateProduct, Product } from '../../models/products.model';
import { form, FormField, required, validate } from '@angular/forms/signals';
import { CategoriesService } from '../../services/categories/categories';
import { Category } from '../../models/categories.model';

@Component({
  selector: 'app-products',
  imports: [FormField],
  templateUrl: './products.html',
  providers: [ProductsService],
})
export class Products implements OnInit {
  public products: any = signal([]);
  public createProductModel = signal<CreateProduct>({
    name: '',
    price: null,
    categoryId: '',
  });
  public editProductModel = signal<Product>({
    id: '',
    name: '',
    price: null,
    categoryId: '',
  });
  public createProductForm = form(this.createProductModel, (f) => {
    required(f.name);
    required(f.price);
    required(f.categoryId);
  });
  protected editProductForm = form(this.editProductModel);
  protected _productsService = inject(ProductsService);
  protected _categoriesService = inject(CategoriesService);
  protected hoveredItemIndex = signal(-1);
  protected data = computed(() => {
    if (this._productsService.productsResource.hasValue() && this._categoriesService.categoriesResource.hasValue()) {
      let products: any = [];
      this._productsService.productsResource.value().forEach((product: Product) => {
        product = {
          ...product,
          ...{
            categoryName: this._categoriesService.categoriesResource.value()
            .find((category: Category) => category.id == product.categoryId)
            ?.name
          }
        };

        products.push(product);
      })

      return products;
    } else return [];
  })

  ngOnInit(): void {
    this._productsService.query.set({ value: '' });
    this._categoriesService.query.set({ value: '' });
  }

  public onFormSubmit(event: Event) {
    event.preventDefault();
    this._productsService.createProduct(this.createProductModel()).subscribe((response) => {
      if (response.id) {
        console.log(`Product created with ID ${response.id}`);
        this._productsService.query.set({ value: '' });
      }
    });
  }

  protected deleteProduct(id: string) {
    this._productsService.deleteProduct(id).subscribe((response) => {
      console.log(`Product with ID ${response} successfully deleted`);
      this._productsService.query.set({ value: '' });
    });
  }

  protected selectProductForEdit(product: Product) {
    this.editProductModel.set(product);
  }

  protected saveChanges() {
    this._productsService.updateProduct(this.editProductModel()).subscribe((response: Product) => {
      console.log(response);
      this.cancelEdit();
      this._productsService.query.set({ value: '' });
    });
  }

  protected cancelEdit() {
    this.editProductModel.set({
      id: '',
      name: '',
      price: null,
      categoryId: '',
    });
  }

  onItemHover(index: number) {
    this.hoveredItemIndex.set(index);
  }

  onItemLeave() {
    this.hoveredItemIndex.set(-1);
  }

}
