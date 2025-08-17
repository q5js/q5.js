import * as ts from "typescript";

const program = ts.createProgram(["./types/framework.d.ts"], {});
const source = program.getSourceFile("./types/framework.d.ts");

if (source) {
  let names: string[] = [];

  findGlobalDeclarations(source);

  // This recursive function finds all interface, type alias, class, enum, function, and variable type declarations in `framework.d.ts`
  // and adds the names of those declarations to the `names` array.
  // AI was used to generate this function, but it was tested and modified to work correctly.
  function findGlobalDeclarations(node: ts.Node) {
    if (
      ts.isModuleDeclaration(node) &&
      node.name.kind === ts.SyntaxKind.Identifier &&
      node.name.text === "global"
    ) {
      if (node.body && ts.isModuleBlock(node.body)) {
        node.body.statements.forEach((stmt) => {
          if (
            ts.isInterfaceDeclaration(stmt) ||
            ts.isTypeAliasDeclaration(stmt) ||
            ts.isClassDeclaration(stmt) ||
            ts.isEnumDeclaration(stmt) ||
            ts.isFunctionDeclaration(stmt) ||
            ts.isVariableStatement(stmt)
          ) {
            // extract the name(s)
            if ("name" in stmt && stmt.name) {
              names.push(stmt.name.text);
            } else if (ts.isVariableStatement(stmt)) {
              stmt.declarationList.declarations.forEach((decl) => {
                if (decl.name && ts.isIdentifier(decl.name)) {
                  names.push(decl.name.text);
                }
              });
            }
          }
        });
      }
    } else {
      ts.forEachChild(node, findGlobalDeclarations);
    }
  }

  names = [...new Set(names)]; // prevent duplicate typeDefs from being generated
  const typeDefs = names.map((name) => `${name}: typeof ${name};`);

  const instanceModeTemplateFile = Bun.file(
    "./types/instance-mode-template.d.ts",
  );
  const instanceModeTemplate = await instanceModeTemplateFile.text();

  const instanceMode = instanceModeTemplate
    .split("\n")
    .flatMap((line) => {
      if (line.includes("%Q5_FRAMEWORK_TYPES%")) {
        return typeDefs;
      }
      return line;
    })
    .join("\n");

  await Bun.write("./types/instance-mode.d.ts", instanceMode);
}
