using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
namespace DatabaseApi.Models;

public partial class Tables
{
    public required string Table { get; set; }

    public required string Schema { get; set; }
}