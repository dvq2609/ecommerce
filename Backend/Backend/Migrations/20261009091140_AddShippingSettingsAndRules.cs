using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddShippingSettingsAndRules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ShippingRules",
                columns: table => new
                {
                    ShippingRuleId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FromLocation = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ToLocation = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Fee = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    EstimatedDeliveryDays = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShippingRules", x => x.ShippingRuleId);
                });

            migrationBuilder.CreateTable(
                name: "ShippingSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FreeShippingThreshold = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DefaultShippingFee = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsFreeShippingEnabled = table.Column<bool>(type: "bit", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShippingSettings", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ShippingRules");

            migrationBuilder.DropTable(
                name: "ShippingSettings");
        }
    }
}
