/**
 * CLI commands:
 * - UPDATE/CHANGE:
 *  - ? <rm-day> - Mon Tues Wed Thu Fri Sat Sun
 *  - ? <add-day> - Mon tues wed thu fri sat sun
 *  - <days> - Mon tues wed thu fri sat sun
 *  - <skip> - true | false
 *  - <warnings> - yes | y | no | n | true | false
 *  later....
 *  - <active> - yes | y | true | 1 | no | n | false | 0
 * - STATUS/INFO/SHOW:
 *  - <help> --> prints out help
 *  - <days>
 *  - <next>
 *  - <warnings>
 *
 * HELP -- cmd
 * skip --undo
 *
 * SHOW days
 * SHOW next
 *
 * Version 1:
 * - help
 * - next
 * - days [options day]
 * - skip [option true/false]
 */

/**
 * directive: CHANGE | STATUS | HELP
 * subcommand: DAYS | MATCH | SKIP
 * cmd arguments: strings, true or false
 */
export enum CliCommand {}

declare interface ICliCommand {}
