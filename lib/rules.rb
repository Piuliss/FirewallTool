module Rules

  CHAINS_BY_TABLE = {filter: [:INPUT, :FORWARD, :OUTPUT], nat: [:PREROUTING, :OUTPUT, :POSTROUTING]}.with_indifferent_access
  DEVICE_BY_CHAIN = {input_device: [:INPUT, :FORWARD, :PREROUTING], output_device: [:OUTPUT, :FORWARD, :POSTROUTING]}.with_indifferent_access
  JOBS_BY_CHAIN = {filter: {INPUT: [:ACCEPT, :DROP, :REJECT], FORWARD: [:ACCEPT, :DROP, :REJECT], OUTPUT: [:ACCEPT, :DROP, :REJECT]},
                   nat: {PREROUTING: [:DNAT], OUTPUT: [:DNAT], POSTROUTING: [:SNAT,:MASQUERADE]}}.with_indifferent_access
end