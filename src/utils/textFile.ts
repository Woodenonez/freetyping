export function importTextFile(file: File): Promise<string> {
  if (!file.name.toLowerCase().endsWith('.txt')) {
    return Promise.reject(new Error('Only .txt files can be imported.'));
  }

  return file.text();
}

export function exportTextFile(text: string, filename = 'freetyping.txt') {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
