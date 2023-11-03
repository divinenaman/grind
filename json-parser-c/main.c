#include<stdio.h>
#include<stdlib.h>

int main() {
  char json[] = "{\"a\":\"\",}";

  int len = 0, i = 0;

  while (json[i] != '\0') {
    len++;
    i++;
  }

  printf("len: %d\n", len);

  int s = 0, e = len - 1;
  
  int error = 0;
  int is_frist_curl = 1;

  char *enclosing_block = malloc((len / 2) * sizeof(char));

  while (s <= e) {
    if (s > e) break;
    char ch1 = *(json + s);
    if (is_frist_curl) {
      char ch2 = *(json + e);
      if (ch1 != '{' || ch2 != '}') {
        error = 1;
        break;
      }
      is_frist_curl = 0;
      *enclosing_block = '{';
    } else {

      if (*enclosing_block == '{') {
        if (ch1 == '}') {
          enclosing_block--;
          s++;
        } else if (ch1 != '"') {
          error = 1;
          break;
        } else {
            *(++enclosing_block) = '"';
        }
      }
      
      else if (*enclosing_block == '"') {
        if (ch1 == '"') {
          enclosing_block--;
          if (*enclosing_block == '{' && *(json + s + 1) != ':') {
            error = 1;
            break;
          } else if (*enclosing_block == ':' && *(json + s + 1) != ',') {
            error = 1;
            break;
          } else if (*enclosing_block == '[' && (*(json + s + 1) != ',' || *(json + s + 1) != ']')) {
            error = 1;
            break;
          }
          
          if (*enclosing_block == '{') {
            s++;
            *(++enclosing_block) = *(json + s);
          } else if (*enclosing_block == '[' && *(json + s + 1) == ',') s++;
        }
      }

      else if (*enclosing_block == ':') {
        if (ch1 == ',') {
          enclosing_block--;
          s++;
        }
        else if (ch1 == '{' || ch1 == '[' || ch1 == '"') {
          *(++enclosing_block) = ch1;
        } else if (ch1 < '0' || ch1 > '9') {
          error = 1;
          break;
        }
      }

      else if (*enclosing_block == '[') {
        if (ch1 == ']') {
          enclosing_block--;
          if (*(json + s + 1) != ',') {
            error = 1;
            break;
          }
          s++;
        } else if (ch1 == '"') {
          // only string array support
          *(++enclosing_block) = ch1;
        } else {
          error = 1;
          break;
        }
      } else {
        error = 1;
        break;
      }
    }
    s++;
  }


  if (error) {
    printf("STATUS: INVALID JSON\n");
  } else {
    printf("STATUS: VALID JSON\n");
  }
 
  return 0;
}
