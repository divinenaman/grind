// https://codingchallenges.fyi/challenges/challenge-json-parser

#include<stdio.h>
#include<stdlib.h>

int json_parse(char *file_path) { 
  FILE *ptr;
  ptr = fopen(file_path, "r");
  
  if (ptr == NULL) {
    printf("file ptr null\n");
    exit(1);
  }

  int error = 0, chunk = 100, l = 0;
  int is_frist_curl = 1;

  int ascii_sum = 0;
  int ascii_sum_true = 't' + 'r' + 'u' + 'e';
  int ascii_sum_false = 'f' + 'a' + 'l' + 's' + 'e';
  int ascii_sum_null = 'n' + 'u' + 'l' + 'l';
  
  char json[chunk]; // = "{\"a\":{}}";

  char *enclosing_block = malloc(chunk * sizeof(char));
  char *prev_block = malloc(chunk * sizeof(char));
  char *prev_prev_block = malloc(chunk * sizeof(char));
  
  *enclosing_block = '\0';
  *prev_block = '\0';
  *prev_prev_block = '\0';
  
  
  while (fgets(json, chunk, ptr)) {
    int len = 0, i = 0, s = 0, e = 0;
    // len of string
    while (json[i] != '\0') {
      len++;
      i++;
    }
    l = l + len;
    e = len - 1;
    
    while (s <= e) {
      if (s > e) break;

      char ch1 = *(json + s);
     
      // skip spaces, newlines, tabs 
      if (ch1 == ' ' || ch1 == '\t' || ch1 == '\n') {
        s+=1;
        continue;
      }

      if (is_frist_curl) {
        // char ch2 = *(json + e);
        // if (ch1 != '{' || ch2 != '}') {
        //   error = 1;
        //   break;
        // }
        
        if (ch1 == '{') {
          is_frist_curl = 0;
          *enclosing_block = '{';
        } else {
          error = 1;
        }
      } else { 
        
        // debug
        // printf("blocks :: %c  ch1:: %c prev1 :: %c prev2 :: %c \n", *enclosing_block, ch1, *prev_prev_block, *prev_block);

        if (*enclosing_block == '{') { 
          // after `:`
          if (*prev_block == ':') {
            // expect new block  
            // string, array, object
            if (ch1 == '"' || ch1 == '[' || ch1 == '{') { 
              *(++enclosing_block) = ch1;
              
              if (ch1 == '{') {
                prev_prev_block++;
                prev_block++;
                
                *prev_block = '\0';
                *prev_prev_block = '\0';
              }
            }
            // number
            else if (ch1 >= '0' && ch1 <= '9') {
              *(++enclosing_block) = 'n';
              // re-run with ch1
              s--;
            } 
            
            // bool or null
            else if (ch1 >= 'a' && ch1 <= 'z') {
              *(++enclosing_block) = 's';
              // re-run
              s--;
            }

            // err
            else {
              error = 2;
            }
          } 
          
          // after `:` followed by a valid block
          else if (*prev_prev_block == ':') {
            // expect prev-block to be number, string, array, object
            // ch1 == "," or "}"
            if (*prev_block == '"' || *prev_block == '[' || *prev_block == '{' || *prev_block == 'n' || *prev_block == 's') {
              if (ch1 == ',') {
                *prev_prev_block = '\0';
                *prev_block = ',';
              } else if (ch1 == '}') {
                // end
                enclosing_block--;
                prev_prev_block--;
                prev_block--;

                *prev_prev_block = *prev_block;
                *prev_block = '{';
              } else {
                error = 3;
              }
            } else {
              error = 4;
            }
          }
          
          // at `:`
          else if (*prev_block == '"') {
            // expect ":"
            if (ch1 == ':') {
              *prev_prev_block = *prev_block;
              *prev_block = ':';
            } else {
              error = 5;
            }
          }

          // before `:`
          else if (ch1 == '"') {
            // expect key as string block 
            *(++enclosing_block) = '"';
          }
          
          // empty {}
          else if (ch1 == '}') {
            if (*prev_block != ',') {
              enclosing_block--;
              prev_prev_block--;
              prev_block--;

              *prev_prev_block = *prev_block;
              *prev_block = '{';
            } else {
              error = 6;
            }
          }

          // err
          else {
            error = 7;
          }
        }
        
        else if (*enclosing_block == '"') {
          // closing quote
          if (ch1 == '"') {
            enclosing_block--;
            *prev_prev_block = *prev_block;
            *prev_block = '"';
          }
          
          // any character
          else {

          }

        }

        else if (*enclosing_block == '[') {
          if (ch1 == ']') {
            enclosing_block--;
            *prev_prev_block = *prev_block;
            *prev_block = '[';
          } else if (ch1 == ',') {
            // TODO: add checks
          } else {
            *(++enclosing_block) = ch1; 
          }
        } 
        
        else if (*enclosing_block == 'n' || (*enclosing_block >= '0' && *enclosing_block <= '9')) {
          if ((ch1 < '0' || ch1 > '9') && ch1 != '.') {
            enclosing_block--;

            *prev_prev_block = *prev_block;
            *prev_block = 'n';

            // re-run with ch1
            s--;
          } else {
            // TODO: add float logic
          }
        }

        else if (*enclosing_block == 's' || (*enclosing_block >= 'a' && *enclosing_block <= 'z')) {
         
          if (ch1 < 'a' || ch1 > 'z') {
            if (ascii_sum == ascii_sum_true || ascii_sum == ascii_sum_false || ascii_sum == ascii_sum_null) {
              ascii_sum = 0;

              // doesn't consider order
              enclosing_block--;
              *prev_prev_block = *prev_block;
              *prev_block = 's';

              // re-run with ch1
              s--;
            } else {
              error = 9;
            } 
          } else {
            ascii_sum += ch1;
          }
        }

        // invalid enclosing-block
        else {
          error = 10;
        }


        if (error) break;
      }
      s++;
    }
    if (error) break;
  }
  
  if (!error && is_frist_curl) {
    // empty string
    error = 11;
  } 

  return error;
}


int main() {
  char *paths[11] = {
    "tests/step1/invalid.json"
  , "tests/step1/valid.json"
  , "tests/step2/invalid.json" 
  , "tests/step2/valid.json"
  , "tests/step2/invalid2.json"
  , "tests/step2/valid2.json"
  , "tests/step3/invalid.json"
  , "tests/step3/valid.json" 
  , "tests/step4/invalid.json"
  , "tests/step4/valid.json"
  , "tests/step4/valid2.json"
  };
    
  char *valid = "VALID";
  char *invalid = "INVALID";

  for (int i = 0; i < 11; i++) {
    char *p = paths[i];
    
    int res = json_parse(p);
    
    printf("path: %s -> %s %d\n", p, res ? invalid : valid, res);
  }

}
