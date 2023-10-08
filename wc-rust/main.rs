use std::env;
use std::convert::TryFrom;
use std::error::Error;

#[derive(Debug)]
enum WcOptions {
    BYTECOUNT,
    LINECOUNT,
    WORDCOUNT,
    CHARACTERCOUNT
}


impl TryFrom<char> for WcOptions {
    type Error = &'static str;

    fn try_from(ch: char) -> Result<Self, Self::Error> {
        match ch {
            'l' => Ok(Self::LINECOUNT),
            'c' => Ok(Self::BYTECOUNT),
            'w' => Ok(Self::WORDCOUNT),
            'm' => Ok(Self::CHARACTERCOUNT),
            _ => Err("invalid option given"),
        }
    }
}

impl Into<u8> for WcOptions {
    fn into(self) -> u8 {
        match self {
            WcOptions::BYTECOUNT => 0,
            WcOptions::LINECOUNT => 1,
            WcOptions::WORDCOUNT => 2,
            WcOptions::CHARACTERCOUNT => 3,
        }
    }
}

impl TryFrom<u8> for WcOptions {
    type Error = &'static str;

    fn try_from(num: u8) -> Result<Self, Self::Error> {
        match num {
            0 => Ok(Self::BYTECOUNT),
            1 => Ok(Self::LINECOUNT),
            2 => Ok(Self::WORDCOUNT),
            3 => Ok(Self::CHARACTERCOUNT),
            _ => Err("invalid option given"),
        }
    }
}

struct WcInput {
    files: Vec<String>,
    options: Vec<WcOptions>
}

impl TryFrom<Vec<String>> for WcInput {
    type Error = &'static str;

    fn try_from(args: Vec<String>) -> Result<Self, Self::Error> {

        let mut option_flags: [bool; 4] = [false, false, false, false];
        let mut files: Vec<String> = Vec::new();

        for raw_arg in args.iter() {
            let arg = raw_arg.trim();
            if arg.starts_with("-") {
                let mut chars = arg.chars();

                // remove '-'
                chars.next();

                for c in chars {
                    let option = WcOptions::try_from(c)?;
                    option_flags[<WcOptions as Into<u8>>::into(option) as usize] = true;
                }
            } else {
                files.push(arg.to_owned());
            }
        }

        let mut options = Vec::new();
        for (i, f) in option_flags.iter().enumerate() {
            if *f {
                options.push(WcOptions::try_from(i as u8)?);
            }
        } 

        Ok(WcInput {
            files,
            options
        })
    }
}

fn main() -> Result<(), Box<dyn Error>> {
    let mut args: Vec<String> = env::args().collect();

    if args.len() == 1 {
        // read from stdin & output all options
        todo!();
    }

    // remove src file
    args.remove(0);

    let wc_input = WcInput::try_from(args)?;

    println!("{:?}", wc_input.files);
    println!("{:?}", wc_input.options);

    Ok(())
}
