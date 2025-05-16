using System.Data;
using System.Text.Json.Serialization;
// using DatabaseApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Text.Json;

namespace DatabaseApi.Controllers;

[ApiController]
[Route("api")]
public class DatabaseController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public DatabaseController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpGet]
    [Route("GetAuthors")]
    public object GetTables()
    {
        SqlConnection con = new(_configuration.GetConnectionString("pubs"));
        SqlDataAdapter da = new("SELECT * FROM authors", con);
        DataTable dt = new();
        da.Fill(dt);
        List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
        foreach (DataRow dr in dt.Rows)
        {
            Dictionary<string, object> row = [];
            foreach (DataColumn col in dt.Columns)
            {
                row.Add(col.ColumnName, dr[col]);
            }
            rows.Add(row);
        }
        return rows;
    }
}
