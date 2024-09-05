-- Dynamic Filters Based on Joins
-- Saved searches can struggle when dynamic filters depend on complex relationships between multiple tables. SuiteQL allows for dynamic queries with multiple joins and subqueries.
SELECT c.entityid, c.companyname, (SELECT COUNT(*) FROM transaction t WHERE t.entity = c.id AND t.type = 'SalesOrd' AND t.status = 'Pending Fulfillment') AS open_sales_orders
FROM customer c
ORDER BY open_sales_orders DESC;
