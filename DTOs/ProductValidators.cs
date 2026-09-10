using FluentValidation;

namespace MyWebApi.DTOs;

public class CreateProductDtoValidator : AbstractValidator<CreateProductDto>
{
    public CreateProductDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Field 'name' is mandatory.")
            .Length(2,10).WithMessage("Field 'name' length must be between 2 and 10 characters.");

        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("Field 'price' must have a positive value.");
    }
}
