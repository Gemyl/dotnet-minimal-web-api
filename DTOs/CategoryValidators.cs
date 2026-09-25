using FluentValidation;

namespace MyWebApi.DTOs;

public class CreateCategoryDtoValidator : AbstractValidator<CreateCategoryDto>
{
    public CreateCategoryDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Field 'Name' is mandatory.")
            .Length(2, 20).WithMessage("Field 'Name' must be between 2 and 20 characters.");        
    }
}

public class UpdateCategoryDtoValidator : AbstractValidator<UpdateCategoryDto>
{
    public UpdateCategoryDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Field 'Name' is mandatory.")
            .Length(2, 20).WithMessage("Field 'Name' must be between 2 and 20 characters.");        
    }
}