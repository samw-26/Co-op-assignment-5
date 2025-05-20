using System;
using System.Collections.Generic;

namespace DatabaseApi.Models;

public partial class Author
{
    public string AuId { get; set; } = null!;

    public string AuLname { get; set; } = null!;

    public string AuFname { get; set; } = null!;

    public string Phone { get; set; } = null!;

    public string? Address { get; set; }

    public string? City { get; set; }

    public string? State { get; set; }

    public string? Zip { get; set; }

    public bool Contract { get; set; }

    public virtual ICollection<Titleauthor> Titleauthors { get; set; } = new List<Titleauthor>();
}
