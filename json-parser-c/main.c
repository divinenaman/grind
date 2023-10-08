#include<stdio.h>

int main() {
  char json[] = "{}";

  int len = 0;


  while (*json != \0) len++;

  int s = 0, e = len;
  int any_parantheses = 0;
  int is_block_open = 0;
  char prev_quote = '';
  char block_char = '';

  while (s <= e) {
    while (s <= e && *(json + s) == ' ') s++;
    while (s < e && *(json + e) == ' ') e--;

    if (s > e) break;
    if (!any_parantheses && *(json + s) != '{') break;

    char ch1 = *(json + s), ch2 = *(json + e);

    if (!is_block_open && ch1 == '{' && ch2 != '}') break;
    
    
    if (ch1 == '"' || ch1 == '\'') {
      if (is_block_open) {     
        if (block_char == ch1) {
          
        } else {
          is_block_open = 1;
          block_char = ch1;
        }
      } else {

      }
    }
    


  }

  printf("Hello World!\n");
  return 0;
}
