export type FoldSection = {
  id: string;
  title: string;
  titleLineIndex: number;
  titleLength: number;
  bodyStart: number;
  bodyEnd: number;
  bodyFoldEnd: number;
  bodyText: string;
  bodyTextWithTerminator: string;
  bodyLineIndex: number;
  bodyLineCount: number;
};

export function findFoldSections(text: string): FoldSection[] {
  const lines = text.split('\n');
  const sections: FoldSection[] = [];
  let offset = 0;
  const lineStartOffsets: number[] = [];

  for (const line of lines) {
    lineStartOffsets.push(offset);
    offset += line.length + 1;
  }

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    const titleMatch = /^# ([^\n]+)$/.exec(line);

    if (!titleMatch) {
      continue;
    }

    let bodyLineCount = 0;

    for (
      let bodyLineIndex = lineIndex + 1;
      bodyLineIndex < lines.length;
      bodyLineIndex += 1
    ) {
      if (lines[bodyLineIndex].trim().length === 0) {
        break;
      }

      bodyLineCount += 1;
    }

    if (bodyLineCount > 0) {
      const bodyStart = lineStartOffsets[lineIndex + 1];
      const bodyEndLineIndex = lineIndex + bodyLineCount;
      const bodyEnd =
        bodyStart + lines.slice(lineIndex + 1, bodyEndLineIndex + 1).join('\n').length;
      const bodyFoldEnd = text[bodyEnd] === '\n' ? bodyEnd + 1 : bodyEnd;

      sections.push({
        id: `${lineStartOffsets[lineIndex]}:${line}`,
        title: titleMatch[1],
        titleLineIndex: lineIndex,
        titleLength: line.length,
        bodyStart,
        bodyEnd,
        bodyFoldEnd,
        bodyText: text.slice(bodyStart, bodyEnd),
        bodyTextWithTerminator: text.slice(bodyStart, bodyFoldEnd),
        bodyLineIndex: lineIndex + 1,
        bodyLineCount,
      });
    }
  }

  return sections;
}
