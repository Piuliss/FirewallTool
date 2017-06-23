module Policies

  CHAINS_BY_TABLE = {filter: [:INPUT, :FORWARD, :OUTPUT], nat: [:PREROUTING, :OUTPUT, :POSTROUTING]}.with_indifferent_access
  JOBS_BY_CHAIN = {filter: {INPUT: [:ACCEPT, :DROP], FORWARD: [:ACCEPT, :DROP], OUTPUT: [:ACCEPT, :DROP]},
                   nat: {PREROUTING: [:ACCEPT], OUTPUT: [:ACCEPT], POSTROUTING: [:ACCEPT]}}.with_indifferent_access
end