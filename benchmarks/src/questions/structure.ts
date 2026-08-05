import type { AnalyticsMetric, Employee, EventLog, Order, Repository } from '../datasets.ts'
import type { Question } from '../types.ts'
import { QuestionBuilder } from './utils.ts'

/**
 * Generates structure-awareness questions across all datasets.
 *
 * These questions test format-native structural affordances:
 * - TOON's explicit array length `[N]` and field declarations `{fields}`
 * - CSV's header row (but no explicit length)
 * - JSON/YAML have neither unless the model counts manually
 */
export function generateStructureQuestions(
  employees: Employee[],
  orders: Order[],
  metrics: AnalyticsMetric[],
  repos: Repository[],
  logs: EventLog[],
  getId: () => string,
): Question[] {
  const questions: Question[] = []

  // #region Tabular dataset (employees)

  // Tests array length awareness.
  questions.push(
    new QuestionBuilder()
      .id(getId())
      .prompt('How many employees are in the dataset?')
      .groundTruth(String(employees.length))
      .type('structure-awareness')
      .dataset('tabular')
      .answerType('integer')
      .build(),
  )

  // Tests field name awareness.
  const employeeFields = 'id,name,email,department,salary,yearsExperience,active'
  questions.push(
    new QuestionBuilder()
      .id(getId())
      .prompt('List the field names for employees (comma-separated, in order).')
      .groundTruth(employeeFields)
      .type('structure-awareness')
      .dataset('tabular')
      .answerType('csv-list-ordered')
      .build(),
  )

  // Tests TOON's `{fields}` syntax.
  questions.push(
    new QuestionBuilder()
      .id(getId())
      .prompt('What is the 3rd field name for employees?')
      .groundTruth('email')
      .type('structure-awareness')
      .dataset('tabular')
      .answerType('string')
      .build(),
  )

  // Tests finding the last row from the declared length.
  const lastEmployee = employees.at(-1)!
  questions.push(
    new QuestionBuilder()
      .id(getId())
      .prompt('What is the department of the last employee in the dataset?')
      .groundTruth(lastEmployee.department)
      .type('structure-awareness')
      .dataset('tabular')
      .answerType('string')
      .build(),
  )

  questions.push(
    new QuestionBuilder()
      .id(getId())
      .prompt('What is the name of the last employee in the dataset?')
      .groundTruth(lastEmployee.name)
      .type('structure-awareness')
      .dataset('tabular')
      .answerType('string')
      .build(),
  )

  // Tests schema awareness.
  questions.push(
    new QuestionBuilder()
      .id(getId())
      .prompt('How many fields does each employee record have?')
      .groundTruth('7')
      .type('structure-awareness')
      .dataset('tabular')
      .answerType('integer')
      .build(),
  )

  // #endregion

  // #region Nested dataset (orders)

  questions.push(
    new QuestionBuilder()
      .id(getId())
      .prompt('How many orders are in the dataset?')
      .groundTruth(String(orders.length))
      .type('structure-awareness')
      .dataset('nested')
      .answerType('integer')
      .build(),
  )

  const orderFields = 'orderId,customer,items,subtotal,tax,total,status,orderDate'
  questions.push(
    new QuestionBuilder()
      .id(getId())
      .prompt('List the top-level field names for orders (comma-separated, in order).')
      .groundTruth(orderFields)
      .type('structure-awareness')
      .dataset('nested')
      .answerType('csv-list-ordered')
      .build(),
  )

  const orderWithManyItems = orders.reduce((max, order) =>
    order.items.length > max.items.length ? order : max,
  )
  questions.push(
    new QuestionBuilder()
      .id(getId())
      .prompt(`How many items are in order ${orderWithManyItems.orderId}?`)
      .groundTruth(String(orderWithManyItems.items.length))
      .type('structure-awareness')
      .dataset('nested')
      .answerType('integer')
      .build(),
  )

  const itemFields = 'sku,name,quantity,price'
  questions.push(
    new QuestionBuilder()
      .id(getId())
      .prompt('What are the field names for items within orders (comma-separated, in order)?')
      .groundTruth(itemFields)
      .type('structure-awareness')
      .dataset('nested')
      .answerType('csv-list-ordered')
      .build(),
  )

  const lastOrder = orders.at(-1)!
  questions.push(
    new QuestionBuilder()
      .id(getId())
      .prompt('What is the status of the last order in the dataset?')
      .groundTruth(lastOrder.status)
      .type('structure-awareness')
      .dataset('nested')
      .answerType('string')
      .build(),
  )

  const customerFields = 'id,name,email,phone'
  questions.push(
    new QuestionBuilder()
      .id(getId())
      .prompt('What are the field names for customer objects within orders (comma-separated, in order)?')
      .groundTruth(customerFields)
      .type('structure-awareness')
      .dataset('nested')
      .answerType('csv-list-ordered')
      .build(),
  )

  // #endregion

  // #region Analytics dataset (metrics)

  questions.push(
    new QuestionBuilder()
      .id(getId())
      .prompt('How many metric records are in the dataset?')
      .groundTruth(String(metrics.length))
      .type('structure-awareness')
      .dataset('analytics')
      .answerType('integer')
      .build(),
  )

  const metricFields = 'date,views,clicks,conversions,revenue,bounceRate'
  questions.push(
    new QuestionBuilder()
      .id(getId())
      .prompt('List the field names for metrics (comma-separated, in order).')
      .groundTruth(metricFields)
      .type('structure-awareness')
      .dataset('analytics')
      .answerType('csv-list-ordered')
      .build(),
  )

  // Tests TOON's `{fields}` syntax.
  questions.push(
    new QuestionBuilder()
      .id(getId())
      .prompt('What is the 5th field name for analytics metrics?')
      .groundTruth('revenue')
      .type('structure-awareness')
      .dataset('analytics')
      .answerType('string')
      .build(),
  )

  const lastMetric = metrics.at(-1)!
  questions.push(
    new QuestionBuilder()
      .id(getId())
      .prompt('What is the date of the last metric record in the dataset?')
      .groundTruth(lastMetric.date)
      .type('structure-awareness')
      .dataset('analytics')
      .answerType('string')
      .build(),
  )

  questions.push(
    new QuestionBuilder()
      .id(getId())
      .prompt('How many fields does each metric record have?')
      .groundTruth('6')
      .type('structure-awareness')
      .dataset('analytics')
      .answerType('integer')
      .build(),
  )

  // #endregion

  // #region GitHub dataset (repositories)

  questions.push(
    new QuestionBuilder()
      .id(getId())
      .prompt('How many repositories are in the dataset?')
      .groundTruth(String(repos.length))
      .type('structure-awareness')
      .dataset('github')
      .answerType('integer')
      .build(),
  )

  const repoFields = 'id,name,repo,description,stars,watchers,forks,defaultBranch,createdAt,updatedAt,pushedAt'
  questions.push(
    new QuestionBuilder()
      .id(getId())
      .prompt('List the field names for repositories (comma-separated, in order).')
      .groundTruth(repoFields)
      .type('structure-awareness')
      .dataset('github')
      .answerType('csv-list-ordered')
      .build(),
  )

  // Tests TOON's `{fields}` syntax.
  questions.push(
    new QuestionBuilder()
      .id(getId())
      .prompt('What is the 7th field name for GitHub repositories?')
      .groundTruth('forks')
      .type('structure-awareness')
      .dataset('github')
      .answerType('string')
      .build(),
  )

  const lastRepo = repos.at(-1)!
  questions.push(
    new QuestionBuilder()
      .id(getId())
      .prompt('What is the name of the last repository in the dataset?')
      .groundTruth(lastRepo.name)
      .type('structure-awareness')
      .dataset('github')
      .answerType('string')
      .build(),
  )

  questions.push(
    new QuestionBuilder()
      .id(getId())
      .prompt('How many fields does each repository record have?')
      .groundTruth('11')
      .type('structure-awareness')
      .dataset('github')
      .answerType('integer')
      .build(),
  )

  // #endregion

  // #region Event logs dataset

  questions.push(
    new QuestionBuilder()
      .id(getId())
      .prompt('How many log entries are in the dataset?')
      .groundTruth(String(logs.length))
      .type('structure-awareness')
      .dataset('event-logs')
      .answerType('integer')
      .build(),
  )

  // Includes the optional `error` field, hence the unordered comparison.
  const logFields = 'timestamp,level,endpoint,statusCode,responseTime,userId,error'
  questions.push(
    new QuestionBuilder()
      .id(getId())
      .prompt('List the field names for log entries (comma-separated, any order, including optional fields).')
      .groundTruth(logFields)
      .type('structure-awareness')
      .dataset('event-logs')
      .answerType('csv-list-unordered')
      .build(),
  )

  const lastLog = logs.at(-1)!
  questions.push(
    new QuestionBuilder()
      .id(getId())
      .prompt('What is the level of the last log entry in the dataset?')
      .groundTruth(lastLog.level)
      .type('structure-awareness')
      .dataset('event-logs')
      .answerType('string')
      .build(),
  )

  // #endregion

  return questions
}
