using System.Data;
using System.Text.Json.Serialization;
// using DatabaseApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace DatabaseApi.Controllers;

[ApiController]
[Route("api")]
public class DatabaseController : ControllerBase
{
    // private readonly IConfiguration _configuration;
    private readonly DatabaseContext _context;

    public DatabaseController(/* IConfiguration configuration */DatabaseContext context)
    {
        // _configuration = configuration;
        _context = context;
    }

    // private List<Dictionary<string, object>> QueryDb(string query)
    // {
    //     SqlConnection con = new(_configuration.GetConnectionString("pubs"));
    //     SqlDataAdapter da = new(query, con);
    //     DataTable dt = new();
    //     da.Fill(dt);
    //     List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
    //     foreach (DataRow dr in dt.Rows)
    //     {
    //         Dictionary<string, object> row = [];
    //         foreach (DataColumn col in dt.Columns)
    //         {
    //             row.Add(col.ColumnName, dr[col]);
    //         }
    //         rows.Add(row);
    //     }
    //     return rows;
    // }

    [HttpGet]
    [Route("tables")]
    public async Task<object> GetTables()
    {
        var tables = await _context.Tables
            .FromSql(
                @$"SELECT TABLE_NAME
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_TYPE='BASE TABLE'")
            .ToListAsync();
        return Ok(tables);
        // return QueryDb(
        //     @"SELECT TABLE_NAME
        //     FROM INFORMATION_SCHEMA.TABLES 
        //     WHERE TABLE_TYPE='BASE TABLE'"
        // );
    }

    // [HttpGet]
    // [Route("{table}")]
    // public object GetTables(string table)
    // {
    //     return QueryDb(
    //         @"SELECT * FROM "
    //     );
    // }
}
